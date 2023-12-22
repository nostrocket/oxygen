import { getEmbeddedEvent, labelledTag } from "$lib/helpers/shouldBeInNDK";
import { pubkeyHasVotepower } from "$lib/protocol_validators/rockets";
import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
import { profiles } from "$lib/stores/hot_resources/profiles";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";
import type { Mutex } from "async-mutex";
import { derived, get, writable, type Readable } from "svelte/store";
import { kindsThatNeedConsensus } from "../event_sources/kinds";
import { changeStateMutex } from "./mutex";
import { Nostrocket, type Account } from "./types";

import {
  MAX_STATECHANGE_EVENT_AGE,
  ignitionPubkey,
  ignoreConsensusEvent,
  nostrocketIgnitionEvent,
  simulateEvents,
} from "../../../settings";
import { HandleHardStateChangeRequest } from "./hard_state/handler";
import { ConsensusMode } from "./hard_state/types";
import { HandleIdentityEvent } from "./soft_state/identity";
import { HandleProblemEvent } from "./soft_state/simplifiedProblems";
import { currentUser } from "../hot_resources/current-user";
import { _rootEvents } from "../event_sources/relays/ndk";
import { id } from "date-fns/locale";
import { weHaveTheLead } from "$lib/consensus/votepower";
import { unixTimeNow } from "$lib/helpers/mundane";
import makeEvent from "$lib/helpers/eventMaker";

export let IdentityOrder = new Map<string, number | undefined>();
export let finalorder = new Array<string>();

export let mempool = derived(_rootEvents, ($all) => {
  let events = new Map<string, NDKEvent>();

  for (let e of $all) {
    events.set(e.id, e);
  }
  return events;
});

//export let failed = writable(new Set<string>()); //these notes are invalid
// export let eligibleForProcessing = derived(
//   [mempool, inState, failed],
//   ([$m, $in, $failed]) => {
//     let filtered = [...$m.values()].filter((e) => {
//       return ![...$in].includes(e.id) && ![...$failed].includes(e.id);
//     });
//     return filtered;
//   }
// );

let softStateMetadata = writable({ inState: new Set<string>() });

let fullStateTip = writable(new Nostrocket());

// export let inState = derived(softStateMetadata, ($ssm) =>{
//   return Array.from($ssm.inState, (is) => is)
// });

export let inState = writable(new Set<string>());

let softState = derived(
  [mempool, inState, softStateMetadata, fullStateTip],
  ([$mempool, $inState, $ssm, $fullStateTip]) => {
    for (let [id, e] of $mempool) {
      if (!$inState.has(id)) {
        switch (e.kind) {
          case 1602:
          case 1031:
          case 15171031:
            if (
              HandleHardStateChangeRequest(
                e,
                $fullStateTip,
                ConsensusMode.ProvisionalScum
              ) == null
            ) {
              inState.update((is) => {
                is.add(id);
                return is;
              });
              fullStateTip.set($fullStateTip);
            }
          case 1592: {
            if (HandleIdentityEvent(e, $fullStateTip)) {
              for (let pk of e.getMatchingTags("p")) {
                if (IdentityOrder.get(pk[1]) == undefined) {
                  IdentityOrder.set(pk[1], e.created_at);
                } else {
                  let createdTime = [
                    IdentityOrder.get(pk[1]),
                    e.created_at,
                  ].reduce((c, n) => (n < c ? n : c));
                  IdentityOrder.set(pk[1], createdTime);
                }
                finalorder = generateArrayOfStrings(
                  IdentityOrder as Map<string, number>
                );
              }
              inState.update((is) => {
                is.add(id);
                return is;
              });
              fullStateTip.set($fullStateTip);
            }
          }
          case 1972:
          case 1971:
            let err = HandleProblemEvent(e, $fullStateTip);
            if (err == null) {
              inState.update((is) => {
                is.add(id);
                return is;
              });
              fullStateTip.set($fullStateTip);
            }
        }
      }
    }
    return $fullStateTip;
  }
);

export let hardStateErrors = writable<Error[]>([]);
hardStateErrors.subscribe((errors) => {
  //if (errors[0]) {console.log("HARD STATE ERROR: ", errors[0])}
});

let hardState = derived(
  [softState, inState, fullStateTip, mempool],
  ([$softState, $inState, $fullStateTip, $mempool]) => {
    //handle consensus events
    let a = Array.from($mempool, ([id, e]) => e);
    a = a.filter((ev: NDKEvent) => {
      return ev.kind == 15172008 || ev.kind == 2008;
    });
    a = a.filter((ev: NDKEvent) => {
      return pubkeyHasVotepower(ev.pubkey, $fullStateTip);
    });
    a = a.filter((ev: NDKEvent) => {
      return (
        labelledTag(ev, "previous", "e") == $fullStateTip.LastConsensusEvent()
      );
    });
    a = a.filter((ev: NDKEvent) => {
      return !$inState.has(ev.id);
    });
    a = a.filter((ev: NDKEvent) => {
      return ev.created_at;
    });
    a.sort((q, w) => {
      return q.created_at - w.created_at;
    });
    //todo: sort by votepower of the pubkey instead and process greatest votepower first
    //todo: if more than one event (multiple consensus events with different request events) then process all of them and and see which one has the greatest cumulative votepower
    //do this with a copy of the state (I think we can use get() on the store to do this?) and only update fullTipState when >50% votepower
    for (let consensusEvent of a) {
      let requestEvent = getEmbeddedEvent(consensusEvent);
      if (requestEvent) {
        let stateCopy = get(fullStateTip);
        let err = HandleHardStateChangeRequest(
          requestEvent,
          $fullStateTip,
          ConsensusMode.FromConsensusEvent
        );
        if (err != null) {
          hardStateErrors.update((errors) => {
            errors.push(err!);
            return errors;
          });
        }
        if (err == null) {
          //todo: check cumulative votepower signing this request event into the consensus chain and only include in current state if >50%
          fullStateTip.update((fst) => {
            fst.ConsensusEvents.push(consensusEvent.id);

            return fst;
          });
        }
      }
    }
  }
);

hardState.subscribe((e) => {});
//create a map of consensus events (requested state change event), and current votepower for each account, and who has signed this consensus event, so that we can produce consensus events later.

//take the current hardstate, and our current user, if we have votepower but havn't signed, produce consensus event.

//take softstate, hardstate, consensus lead, and produce consensus events raw if needed.
softState.subscribe((ss) => {
  //console.log(ss.Problems.size)
});

fullStateTip.subscribe((fst) => {
  //console.log(fst)
});

export const consensusTipState = derived(fullStateTip, ($fst) => {
  return $fst;
});

//const watchMempoolMutex = new Mutex();

// async function watchMempool() {
//   let lastNumberOfEventsHandled = 0;
//   let attempted = new Map<string, boolean>();
//   watchMempoolMutex.acquire().then(() => {
//     eligibleForProcessing.subscribe((e) => {
//       //todo: prevent this from infinitely looping.
//       let eventsHandled = get(inState).size;
//       if (
//         eventsHandled > lastNumberOfEventsHandled ||
//         !attempted.get(e[e.length - 1].id)
//       ) {
//         attempted.set(e[e.length - 1].id, true);
//         lastNumberOfEventsHandled = eventsHandled;
//         changeStateMutex("state:93").then((release) => {
//           let current = get(consensusTipState);
//           let newstate = processSoftStateChangeReqeustsFromMempool(
//             current,
//             eligibleForProcessing
//           );
//           consensusTipState.set(newstate);
//           release();
//         });
//       }
//     });
//   });
// }

function generateArrayOfStrings(map: Map<string, number>): string[] {
  const entriesArray: [string, number][] = Array.from(map.entries());

  entriesArray.sort((a, b) => a[1] - b[1]);

  const keysInOrder: string[] = entriesArray.map((entry) => entry[0]);

  return keysInOrder;
}

// function processSoftStateChangeReqeustsFromMempool(
//   currentState: Nostrocket,
//   eligible: Readable<NDKEvent[]>
// ): Nostrocket {
//   let handled: NDKEvent[] = [];
//   //let newState:Nostrocket = clone(currentState)
//   let currentList = [...get(eligible)];
//   for (let e of currentList) {
//     let copyOfState = currentState.Copy();
//     //todo: clone not ref
//     switch (e.kind) {
//       case 1602:
//       case 1031:
//       case 15171031:
//         HandleHardStateChangeRequest(
//           e,
//           currentState,
//           ConsensusMode.ProvisionalScum
//         );
//       case 1592: {
//         if (HandleIdentityEvent(e, copyOfState)) {
//           for (let pk of e.getMatchingTags("p")) {
//             if (IdentityOrder.get(pk[1]) == undefined) {
//               IdentityOrder.set(pk[1], e.created_at);
//             } else {
//               let createdTime = [IdentityOrder.get(pk[1]), e.created_at].reduce(
//                 (c, n) => (n < c ? n : c)
//               );
//               IdentityOrder.set(pk[1], createdTime);
//             }
//             finalorder = generateArrayOfStrings(
//               IdentityOrder as Map<string, number>
//             );
//           }
//           currentState = copyOfState;
//           handled.push(e);
//         }
//       }
//       case 1972:
//       case 1971:
//         let err = HandleProblemEvent(e, copyOfState);
//         if (
//           e.id ==
//           "8be312497fc03524bcf8f963dabe4035c53a5f3e4fd46c193ff33c3f207c5f99"
//         ) {
//           console.log(143);
//         }
//         if (err != undefined) {
//           //console.log(err, e.id)
//         } else {
//           currentState = copyOfState;
//           handled.push(e);
//         }
//     }
//   }
//   if (handled.length > 0) {
//     for (let h of handled) {
//       inState.update((is) => {
//         is.add(h.id);
//         return is;
//       });
//     }
//     return processSoftStateChangeReqeustsFromMempool(currentState, eligible);
//   }
//   return currentState;
// }

// const consensusNotes = derived(eligibleForProcessing, ($vce) => {
//   $vce = $vce.filter((event: NDKEvent) => {
//     return pubkeyHasVotepower(event.pubkey, get(consensusTipState)); //validate(event, get(consensusTipState), 15172008);
//   });

//   $vce = $vce.filter((event: NDKEvent) => {
//     //event previous label == HEAD
//     //todo: track mutiple HEADs so that we can follow multiple pubkeys:
//     //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
//     return (
//       get(consensusTipState).LastConsensusEvent() ==
//       labelledTag(event, "previous", "e")
//     );
//   });

//   $vce = $vce.filter((event: NDKEvent) => {
//     return event.id != ignoreConsensusEvent;
//   });
//   return $vce;
// });

let notInMempoolError = new Map<string, string>();
let lastConsensusEventAttempt: string = "";

// consensusNotes.subscribe((x) => {
//   let consensusNote = x[x?.length - 1];
//   if (
//     consensusNote &&
//     consensusNote.id != lastConsensusEventAttempt &&
//     !notInMempoolError.has(consensusNote?.id)
//   ) {
//     lastConsensusEventAttempt = consensusNote.id;
//     let request = labelledTag(consensusNote, "request", "e");
//     if (!request) {
//       console.log(consensusNote);
//     }
//     if (request) {
//       let requestEvent: NDKEvent | undefined = get(mempool).get(request);
//       changeStateMutex(request).then((release) => {
//         let current = get(consensusTipState);
//         if (!requestEvent) {
//           notInMempoolError.set(consensusNote.id, request!);
//           console.log(
//             "event1: ",
//             request,
//             " for consensus event ",
//             consensusNote.id,
//             " is not in mempool"
//           );
//         }
//         if (requestEvent) {
//           let err = HandleHardStateChangeEvent(requestEvent, current);
//           if (err != null) {
//             console.log(err.message, requestEvent, consensusNote);
//             failed.update((f) => {
//               f.add(consensusNote.id);
//               return f;
//             });
//           }
//           if (err == null) {
//             inState.update((is) => {
//               is.add(requestEvent!.id!);
//               is.add(consensusNote.id);
//               return is;
//             });
//             current.ConsensusEvents.push(consensusNote.id);
//             consensusTipState.set(current);
//             init();
//           }
//         }
//         release();
//       });
//     }
//   }
// });

// mempool.subscribe((m) => {
//   for (const [consensusNoteId, eventId] of notInMempoolError) {
//     let requestEvent: NDKEvent | undefined = m.get(eventId);
//     if (requestEvent != undefined) {
//       let x = get(consensusNotes);
//       let consensusNote = x[x?.length - 1];
//       if (consensusNote) {
//         lastConsensusEventAttempt = consensusNote.id;
//         let request = labelledTag(consensusNote, "request", "e");
//         if (!request) {
//           console.log(consensusNote);
//         }
//         if (request) {
//           let requestEvent: NDKEvent | undefined = get(mempool).get(request);
//           changeStateMutex(request).then((release) => {
//             let current = get(consensusTipState);
//             if (!requestEvent) {
//               notInMempoolError.set(consensusNote.id, request!);
//               console.log(
//                 "event1: ",
//                 request,
//                 " for consensus event ",
//                 consensusNote.id,
//                 " is not in mempool"
//               );
//             }
//             if (requestEvent) {
//               let err = HandleHardStateChangeEvent(requestEvent, current);
//               if (err != null) {
//                 console.log(err.message, requestEvent);
//                 failed.update((f) => {
//                   f.add(consensusNote.id);
//                   return f;
//                 });
//               }
//               if (err == null) {
//                 inState.update((is) => {
//                   is.add(requestEvent!.id!);
//                   is.add(consensusNote.id);
//                   return is;
//                 });
//                 current.ConsensusEvents.push(consensusNote.id);
//                 consensusTipState.set(current);
//                 init();
//               }
//             }
//             release();
//           });
//         }
//       }
//     }
//   }
// });

// let initted = false;
// async function init() {
//   if (!initted) {
//     initted = true;
//     //initProblems(consensusTipState)
//     watchMempool();
//   }
// }

export const nostrocketParticipants = derived(consensusTipState, ($cts) => {
  let orderedList: Account[] = [];
  recursiveList(
    nostrocketIgnitionEvent,
    ignitionPubkey,
    $cts,
    orderedList,
    "participants"
  );
  return orderedList;
});

export const currentUserIsParticipant = derived(
  [nostrocketParticipants, currentUser],
  ([$particpants, $currentUser]) => {
    if (!$currentUser) {
      return false;
    }
    if ($currentUser) {
      if ($currentUser.pubkey) {
        if ($particpants.includes($currentUser.pubkey)) {
          return true;
        }
      }
    }
    return false;
  }
);

export const nostrocketMaintiners = derived(consensusTipState, ($cts) => {
  let orderedList: Account[] = [];
  recursiveList(
    nostrocketIgnitionEvent,
    ignitionPubkey,
    $cts,
    orderedList,
    "maintainers"
  );
  return orderedList;
});

function recursiveList(
  rocket: string,
  rootAccount: Account,
  state: Nostrocket,
  orderedList: Account[],
  listType: string
) {
  if (!orderedList.includes(rootAccount)) {
    orderedList.push(rootAccount);
  }
  let r = state.RocketMap.get(rocket);
  if (r) {
    let data = r.Participants.get(rootAccount);
    if (listType == "maintainers") {
      data = r.Maintainers.get(rootAccount);
    }
    if (data) {
      for (let pk of data) {
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
      orderedProfiles.push({
        profile: profile,
        index: finalorder.indexOf(pk) + 1,
      });
    }
  }
  return orderedProfiles.reverse();
});

export const nostrocketMaintainerProfiles = derived(profiles, ($p) => {
  let orderedProfiles: { profile: NDKUser; index: number }[] = [];
  let index = 0;
  for (let pk of get(nostrocketMaintiners)) {
    let profile = $p.get(pk);
    if (profile) {
      orderedProfiles.push({ profile: profile, index: index });
    }
    index++;
  }
  return orderedProfiles.reverse();
});

export async function rebroadcastEvents(mutex: Mutex) {
  let is = get(inState);
  for (let e of is) {
    let event = get(mempool).get(e);
    if (event) {
      mutex.acquire().then((release) => {
        event!.ndk = get(ndk_profiles);
          event!.publish()
          .then((r) => {
            console.log(r);
          })
          .finally(() => {
            release();
          });
      });
    }
  }
}

let dedupList = writable(new Set<string>());

let requiresOurConsensus = derived(
  [currentUser, fullStateTip, mempool, dedupList],
  ([$currentUser, $fullStateTip, $mempool, $deduplist]) => {
    let eventArray: NDKEvent[] = [];
    if ($currentUser) {
      if ($currentUser.pubkey == ignitionPubkey) {
        let requiresConsensus = new Set<string>();
        //for now, we are 100% centralized on the ignition pubkey
        //todo: calculate votepower for everyone
        //todo: emit online indicator as ephemeral events
        //todo: check votepower of everyone online and see if we are the highest
        for (let [id, rocket] of $fullStateTip.RocketMap) {
          if (rocket.RequiresConsensus()) {
            for (let evID of rocket._requriesConsensus) {
              requiresConsensus.add(evID);
            }
          }
        }

        for (let evID of requiresConsensus) {
          let ev = $mempool.get(evID);
          if (ev) {
            if (ev.created_at! < unixTimeNow() && !$deduplist.has(ev.id)) {
              //todo: validate max age
              eventArray.push(ev);
            }
          }
        }
        eventArray = eventArray.sort((a, b) => {
          return a.created_at! - b.created_at!;
        });
      }
    }
    return eventArray;
  }
);

let consensusChainLength = derived(fullStateTip, ($fullStateTip)=>{
  return $fullStateTip.ConsensusEvents.length
})

let newConsensusEvents = derived(
  [dedupList, requiresOurConsensus, fullStateTip, consensusChainLength],
  ([$deduplist, $requiresOurConsensus, $fullStateTip]) => {
    for (let ev of $requiresOurConsensus) {
      if (
        !$deduplist.has(ev.id) &&
        !$deduplist.has($fullStateTip.LastConsensusEvent())
      ) {
        dedupList.update((ddl) => {
          ddl.add(ev.id);
          ddl.add($fullStateTip.LastConsensusEvent())
          return ddl;
        });
        let e = makeEvent({ kind: 15172008 });
        e.tags.push(["e", ev.id, "", "request"]);
        e.tags.push(["event", JSON.stringify(ev.rawEvent())]);
        e.tags.push(["e", $fullStateTip.LastConsensusEvent(), "", "previous"]);
        return e;
      }
    }
  }
);

let publishedConsensusEvents = derived(
  [newConsensusEvents, consensusChainLength],
  ([$newConsensusEvents, $consensusChainLength]) => {
    let ev = $newConsensusEvents;
    if (ev && !simulateEvents) {
      ev.publish().then((r)=>{
        console.log(r)
        let e = makeEvent({ kind: 12008 });
        e.tags.push(["lastest", ev!.id]);
        e.tags.push(["length", $consensusChainLength.toString()]);
        e.publish().then(()=>{return e})
      })
    }
  }
);

publishedConsensusEvents.subscribe((e) => {
  console.log(e);
});
