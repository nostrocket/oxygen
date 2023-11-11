import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { validate } from "$lib/protocol_validators/rockets";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import { derived, get, writable, type Readable } from "svelte/store";
import { kindsThatNeedConsensus } from "../event_sources/kinds";
import { allNostrocketEvents } from "../event_sources/relays/ndk";
import { changeStateMutex } from "./mutex";
import { Nostrocket } from "./types";

import { HandleHardStateChangeRequest } from "./hard_state/handler";
import { ConsensusMode } from "./hard_state/types";
import { HandleProblemEvent } from "./soft_state/simplifiedProblems";

let r: Nostrocket = new Nostrocket();

export const consensusTipState = writable(r);
let _mempool = new Map<string, NDKEvent>();
let _inState = new Set<string>();
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
  let list: NDKEvent[] = [];
  $nis.forEach((e) => {
    try {
      if (kindsThatNeedConsensus.includes(e.kind!)) {
        list.push(e);
      }
    } catch {}
  });
  return list;
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
        changeStateMutex("state:244").then((release) => {
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

function processSoftStateChangeReqeustsFromMempool(
  currentState: Nostrocket,
  eligible: Readable<NDKEvent[]>
): Nostrocket {
  let handled: NDKEvent[] = [];
  //let newState:Nostrocket = clone(currentState)
  let currentList = [...get(eligible)];
  currentList.forEach((e) => {
    //todo clone not ref
    switch (e.kind) {
      case 31009: {
        let [n, success] = handleIdentityEvent(e, currentState);
        if (success) {
          currentState = n;
          handled.push(e);
        }
      }
      case 1972:
      case 1971:
        if (HandleProblemEvent(e, currentState)) {
          handled.push(e);
        }
      // problemEvents.update(pe=>{
      //   if (!pe.get(e.id)) {
      //     pe.set(e.id, e)
      //   }
      //   return pe
      // })
    }
  });
  if (handled.length > 0) {
    handled.forEach((h) => {
      inState.update((is) => {
        is.add(h.id);
        return is;
      });
    });
    return processSoftStateChangeReqeustsFromMempool(currentState, eligible);
  }
  return currentState;
}

function handleIdentityEvent(
  e: NDKEvent,
  c: Nostrocket
): [Nostrocket, boolean] {
  let successful = false;
  e.getMatchingTags("d").forEach((dTag) => {
    if (dTag[1].length == 64) {
      let r = c.RocketMap.get(dTag[1]);
      if (r?.UID == dTag[1]) {
        if (r.updateParticipants(e)) {
          c.RocketMap.set(r.UID, r);
          inState.update((is) => {
            is.add(e.id);
            return is;
          });
          successful = true;
        }
      }
    }
  });
  return [c, successful];
}

const consensusNotes = derived(eligibleForProcessing, ($vce) => {
  $vce = $vce.filter((event: NDKEvent) => {
    return validate(event, get(consensusTipState), 15172008);
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
          let ok = HandleHardStateChangeEvent(requestEvent, current);
          if (!ok) {
            failed.update((f) => {
              f.add(consensusNote.id);
              return f;
            });
          }
          if (ok) {
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
): boolean {
  let needsConsensus = kindsThatNeedConsensus.includes(requestEvent.kind!);
  if (validate(requestEvent, state) && needsConsensus) {
    let ok = false;
    let typeOfFailure;
    [state, typeOfFailure, ok] = HandleHardStateChangeRequest(
      requestEvent,
      state,
      ConsensusMode.Scum
    );
    if (ok) {
      return true;
    }
  }
  return false;
}
