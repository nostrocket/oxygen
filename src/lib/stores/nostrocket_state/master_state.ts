
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { pubkeyHasVotepower } from "$lib/protocol_validators/rockets";
import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
import { profiles } from "$lib/stores/hot_resources/profiles";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import { derived, get, writable, type Readable } from "svelte/store";
import { kindsThatNeedConsensus } from "../event_sources/kinds";
import { allNostrocketEvents } from "../event_sources/relays/ndk";
import { changeStateMutex } from "./mutex";
import { Nostrocket, type Account } from "./types";

import { ignitionPubkey, nostrocketIgnitionEvent } from "../../../settings";
import { HandleHardStateChangeRequest } from "./hard_state/handler";
import { ConsensusMode } from "./hard_state/types";
import { HandleIdentityEvent } from "./soft_state/identity";
import { HandleProblemEvent } from "./soft_state/simplifiedProblems";

let r: Nostrocket = new Nostrocket();

export const consensusTipState = writable(r);
let _mempool = new Map<string, NDKEvent>();
let _inState = new Set<string>();
export let IdentityOrder = new Map<string, number|undefined>();
export let finalorder = new Array<string>();
export let mempool = writable(_mempool);
export let inState = writable(_inState); //these notes exist in state
export let failed = writable(_inState); //these notes are invalid
export let eligibleForProcessing = derived(
  [mempool, inState, failed],
  ([$m, $in, $failed]) => {
    //console.log([...$m])
    let filtered = [...$m.values()].filter((e) => {
      return ![...$in].includes(e.id) && ![...$failed].includes(e.id);
    });
    return filtered;
  }
);

export let stateChangeEvents = derived(eligibleForProcessing, ($nis) => {
  let schindlers: NDKEvent[] = [];
  for (let e of $nis) {
    if (kindsThatNeedConsensus.includes(e.kind!)) {
      schindlers.push(e);
    }
  }
  return schindlers;
});

allNostrocketEvents.subscribe((e) => {
  if (e[0]) {
    if (!get(mempool).has(e[0].id)) {
      mempool.update((m) => {
        return m.set(e[0].id, e[0]);
      });
    }
  }
});

export let notesInState = derived([inState, mempool], ([$in, $mem]) => {
  let filtered = [...$mem.values()].filter((e) => {
    return [...$in].includes(e.id);
  });
  return filtered;
});

//Build the current Hard state from Consensus Notes (follow a consensus chain and handle each embedded hard state change request)

// //Build the current Soft state from Soft State Change Requests (handle these directly from relays)
// eose.subscribe((val)=>{
//     //or maybe just do this when we have reached current HEAD instead of on EOSE
//     if (val) {
//       console.log("EOSE")
//       initProblems(consensusTipState)
//       watchMempool();
//     }
//   })

const watchMempoolMutex = new Mutex();
async function watchMempool() {
  let lastNumberOfEventsHandled = 0;
  let attempted = new Map<string, boolean>();
  watchMempoolMutex.acquire().then(() => {
    eligibleForProcessing.subscribe((e) => {
      //todo prevent this from infinitely looping.
      let eventsHandled = get(inState).size;
      if (
        eventsHandled > lastNumberOfEventsHandled ||
        !attempted.get(e[e.length - 1].id)
      ) {
        attempted.set(e[e.length - 1].id, true);
        lastNumberOfEventsHandled = eventsHandled;
        changeStateMutex("state:93").then((release) => {
          let current = get(consensusTipState);
          let newstate = processSoftStateChangeReqeustsFromMempool(
            current,
            eligibleForProcessing
          );
          consensusTipState.set(newstate);
          release();
        });
      }
    });
  });
}
function generateArrayOfStrings(map: Map<string, number>): string[] {
  const entriesArray: [string, number][] = Array.from(map.entries());

  entriesArray.sort((a, b) => a[1] - b[1]);

  const keysInOrder: string[] = entriesArray.map((entry) => entry[0]);

  return keysInOrder;
}

function processSoftStateChangeReqeustsFromMempool(
  currentState: Nostrocket,
  eligible: Readable<NDKEvent[]>
): Nostrocket {
  let handled: NDKEvent[] = [];
  //let newState:Nostrocket = clone(currentState)
  let currentList = [...get(eligible)];
  for (let e of currentList) {
    let copyOfState = currentState.Copy()
    //todo clone not ref
    switch (e.kind) {
      case 1031:
      case 15171031:
        HandleHardStateChangeRequest(e, currentState, ConsensusMode.ProvisionalScum)
      case 1592: {
        if (HandleIdentityEvent(e, copyOfState)) {
          for (let pk of e.getMatchingTags("p")) {
            if (IdentityOrder.get(pk[1]) == undefined ){
              IdentityOrder.set(pk[1], e.created_at)
            }
            else{
              let createdTime =  [IdentityOrder.get(pk[1]),e.created_at].reduce(
                (c, n) => n < c ? n : c)
              IdentityOrder.set(pk[1],createdTime) 
            }
            finalorder = generateArrayOfStrings(IdentityOrder as  Map<string,number>)
          }
          currentState = copyOfState;
          handled.push(e);
        }
      }
      case 1972:
      case 1971:
        let err = HandleProblemEvent(e, copyOfState)
        if (err != undefined) {
          //console.log(err, e.id)
        } else {
          currentState = copyOfState
          handled.push(e);
        }
    }
  }
  if (handled.length > 0) {
    for (let h of handled) {
      inState.update((is) => {
        is.add(h.id);
        return is;
      });
    }
    return processSoftStateChangeReqeustsFromMempool(currentState, eligible);
  }
  return currentState;
}

// function handleIdentityEvent(
//   e: NDKEvent,
//   c: Nostrocket
// ): [Nostrocket, boolean] {
//   let successful = false;
//   for (let dTag of e.getMatchingTags("d")) {
//     if (dTag[1].length == 64) {
//       let r = c.RocketMap.get(dTag[1]);
//       if (r?.UID == dTag[1]) {
//         if (r.updateParticipants(e)) {
//           c.RocketMap.set(r.UID, r);
//           inState.update((is) => {
//             is.add(e.id);
//             return is;
//           });
//           successful = true;
//         }
//       }
//     }
//   }
//   return [c, successful];
// }

const consensusNotes = derived(eligibleForProcessing, ($vce) => {
  $vce = $vce.filter((event: NDKEvent) => {
    return pubkeyHasVotepower(event.pubkey, get(consensusTipState))//validate(event, get(consensusTipState), 15172008);
  });

  $vce = $vce.filter((event: NDKEvent) => {
    //event previous label == HEAD
    //todo track mutiple HEADs so that we can follow multiple pubkeys:
    //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
    return (
      get(consensusTipState).LastConsensusEvent() ==
      labelledTag(event, "previous", "e")
    );
  });
  return $vce;
});

let notInMempoolError = new Map<string, string>();
let lastConsensusEventAttempt: string = "";

consensusNotes.subscribe((x) => {
  let consensusNote = x[x?.length - 1];
  if (
    consensusNote &&
    consensusNote.id != lastConsensusEventAttempt &&
    !notInMempoolError.has(consensusNote?.id)
  ) {
    lastConsensusEventAttempt = consensusNote.id;
    let request = labelledTag(consensusNote, "request", "e");
    if (!request) {
      console.log(consensusNote);
    }
    if (request) {
      let requestEvent: NDKEvent | undefined = get(mempool).get(request);
      changeStateMutex(request).then((release) => {
        let current = get(consensusTipState);
        if (!requestEvent) {
          notInMempoolError.set(consensusNote.id, request!);
          console.log(
            "event: ",
            request,
            " for consensus event ",
            consensusNote.id,
            " is not in mempool"
          );
        }
        if (requestEvent) {
          let err = HandleHardStateChangeEvent(requestEvent, current);
          if (err != null) {
            console.log(err.message, requestEvent)
            failed.update((f) => {
              f.add(consensusNote.id);
              return f;
            });
          }
          if (err == null) {
            inState.update((is) => {
              is.add(requestEvent!.id!);
              is.add(consensusNote.id);
              return is;
            });
            current.ConsensusEvents.push(consensusNote.id);
            consensusTipState.set(current);
            init();
          }
        }
        release();
      });
    }
  }
});

let initted = false;
async function init() {
  if (!initted) {
    initted = true;
    //initProblems(consensusTipState)
    watchMempool();
  }
}

export function HandleHardStateChangeEvent(
  requestEvent: NDKEvent,
  state: Nostrocket
):Error|null {
  if (!kindsThatNeedConsensus.includes(requestEvent.kind!)) {
    return new Error("this kind does not require consensus")
  }
  return HandleHardStateChangeRequest(
    requestEvent,
    state,
    ConsensusMode.FromConsensusEvent
    );
}

export const nostrocketParticipants = derived(consensusTipState, ($cts) => {
  let orderedList: Account[] = [];
  recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $cts, orderedList, "participants");
  return orderedList;
});


export const nostrocketMaintiners = derived(consensusTipState, ($cts) => {
  let orderedList: Account[] = [];
  recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $cts, orderedList, "maintainers");
  return orderedList;
});

function recursiveList(
  rocket: string,
  rootAccount: Account,
  state: Nostrocket,
  orderedList: Account[],
  listType:string
) {
  if (!orderedList.includes(rootAccount)) {
    orderedList.push(rootAccount);
  }
  let r = state.RocketMap.get(rocket)
  if (r) {
    let data = r.Participants.get(rootAccount)
    if (listType == "maintainers") {
      data = r.Maintainers.get(rootAccount)
    }
    if (data) {
      for (let pk of data){
        if (pk.length == 64 && !orderedList.includes(pk)) {
          recursiveList(rocket, pk, state, orderedList, listType);
        }
      }
    }
  }
  return orderedList;
}

nostrocketParticipants.subscribe((pkList) => {
  for (let pk of pkList) {
    let user = get(ndk_profiles).getUser({ hexpubkey: pk });
    user.fetchProfile().then(() => {
      profiles.update((data) => {
        let existing = data.get(user.pubkey);
        if (!existing) {
          data.set(user.pubkey, user);
        }
        if (
          user.profile?.name &&
          user.profile.about &&
          user.profile.displayName
        ) {
          data.set(user.pubkey, user);
        }
        return data;
      });
    });
  }
});


export const nostrocketParticipantProfiles = derived(profiles, ($p) => {
  let orderedProfiles: { profile: NDKUser; index: number }[] = [];
  for (let pk of get(nostrocketParticipants)) {
    let profile = $p.get(pk);
    if (profile) {
      orderedProfiles.push({ profile: profile, index: finalorder.indexOf(pk)+1});
    }
  }
  return orderedProfiles.reverse();
});

export const nostrocketMaintainerProfiles = derived(profiles, ($p) => {
  let orderedProfiles: { profile: NDKUser; index: number }[] = [];
  let index = 0
  for (let pk of get(nostrocketMaintiners)) {
    let profile = $p.get(pk);
    if (profile) {
      orderedProfiles.push({ profile: profile, index: index});
    }
    index++
  }
  return orderedProfiles.reverse();
});

export async function rebroadcastEvents(mutex: Mutex) {
  let is = get(inState)
  for (let e of is) {
    let event = get(mempool).get(e)
    if (event) {  
      mutex.acquire().then((release)=>{
        event.ndk = get(ndk_profiles)
        event.publish().then(r=>{
        }).finally(()=>{release()})
      })
  
    }
  }
}
