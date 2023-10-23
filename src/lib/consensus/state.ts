
// export const nostrocketParticipantProfiles = derived(profiles, ($p) => {
//   let orderedProfiles: { profile: NDKUser; index: number }[] = [];
//   get(nostrocketParticipants).forEach((pk, i) => {
//     let profile = $p.get(pk);
//     if (profile) {
//       orderedProfiles.push({ profile: profile, index: i });
//     }
//   });
//   return orderedProfiles.reverse();
// });

// export let notPrecalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
//   $nr = $nr.filter((event: NDKEvent) => {
//     return event.kind != 10311;
//   });
//   return $nr;
// });

// export let validConsensusEvents = derived(allNostrocketEvents, ($vce) => {
//   $vce = $vce.filter((event: NDKEvent) => {
//     return labelledTag(event, "root", "e") == rootEventID;
//   });
//   $vce = $vce.filter((event: NDKEvent) => {
//     return validate(event, get(consensusTipState));
//   });

//   $vce = $vce.filter((event: NDKEvent) => {
//     //event previous label == HEAD
//     //todo track mutiple HEADs so that we can follow multiple pubkeys:
//     //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
//     return (
//       get(consensusTipState).LastConsensusEvent() ==
//       labelledTag(event, "previous", "e")
//     );
//   });
//   return $vce;
// });



// validConsensusEvents.subscribe((x) => {
//   if (x[0]) {
//     let request = labelledTag(x[0], "request", "e");
//     if (request) {
//       let requestEvent = mempool.fetch(request);
//       changeStateMutex(request).then((release) => {
//         let current = get(consensusTipState);
//         if (!requestEvent) {
//           console.log(
//             "event: ",
//             request,
//             " for consensus event ",
//             x[0].id,
//             " is not in mempool"
//           );
//         }
//         if (requestEvent) {
//           if (validate(requestEvent, current)) {
//             //todo use copy instead of reference (newstate is just a reference here) have to write a manual clone function for this
//             let [newstate, ok] = current.HandleStateChangeEvent(requestEvent);
//             if (ok) {
//               eventsInState.push(x[0]);
//               mempool.pop(x[0].id);
//               eventsInState.push(requestEvent);
//               mempool.pop(requestEvent.id);
//               newstate.ConsensusEvents.push(x[0].id);
//               processMempool(newstate);
//               consensusTipState.set(newstate);
//             }
//           }
//         }
//         release();
//       });
//     }
//   }
// });

// eose.subscribe((val)=>{
//   if (val) {
//     console.log("EOSE");
//     watchMempool();
//   }
// })

// const watchMempoolMutex = new Mutex();
// async function watchMempool() {
//   let last = 0;
//   watchMempoolMutex.acquire().then(() => {
//     mempool.subscribe(() => {
//       changeStateMutex("state:244").then((release) => {
//         let current = get(consensusTipState);
//         let newstate = processMempool(current);
//         consensusTipState.set(newstate);
//         release();
//       });
//     });
//   });
// }

// function processMempool(currentState: Nostrocket): Nostrocket {
//   let handled: NDKEvent[] = [];
//   //let newState:Nostrocket = clone(currentState)
//   mempool.singleIterator().forEach((e) => {
//     //todo clone not ref
//     switch (e.kind) {
//       case 30000: {
//         let [n, success] = handleIdentityEvent(e, currentState);
//         if (success) {
//           currentState = n;
//           handled.push(e);
//         }
//       }
//       case 15171971:
//       case 15171972:
//       case 15171973:
//       case 31971: {
//         let [n, success] = handleProblemEvent(e, currentState);
//         if (success) {
//           currentState = n;
//           handled.push(e);
//         }
//       }
//     }
//   });
//   if (handled.length > 0) {
//     handled.forEach((h) => {
//       //console.log(261, " ", h.kind)
//       mempool.pop(h.id);
//       eventsInState.push(h);
//     });
//     return processMempool(currentState);
//   }
//   return currentState;
// }

// function handleProblemEvent(e: NDKEvent, c: Nostrocket): [Nostrocket, boolean] {
//   switch (e.kind) {
//     case 15171971:
//       //Problem ANCHOR
//       return c.HandleLightStateChangeEvent(e);
//     case 31971:
//       //Problem HEAD
//       return c.HandleLightStateChangeEvent(e);
//   }
//   return [c, false];
// }

// function handleIdentityEvent(
//   e: NDKEvent,
//   c: Nostrocket
// ): [Nostrocket, boolean] {
//   let successful = false;
//   e.getMatchingTags("d").forEach((dTag) => {
//     if (dTag[1].length == 64) {
//       let r = c.RocketMap.get(dTag[1]);
//       if (r) {
//         if (r.updateParticipants(e)) {
//           c.RocketMap.set(r.UID, r);
//           eventsInState.push(e);
//           mempool.pop(e.id);
//           successful = true;
//         }
//       }
//     }
//   });
//   return [c, successful];
// }

// export const Problems = derived(consensusTipState, ($nr) => {
//   let problems: Problem[] = [];
//   $nr.Problems.forEach((p) => {
//     if (p.Head) {
//       problems.push(p);
//     }
//   });
//   //return $nr.Problems
//   return problems;
// });

// export const Rockets = derived(consensusTipState, ($nr) => {
//   return $nr.RocketMap;
// });

// const requested = new Map();
// consensusTipState.subscribe((state) => {
//   state.Problems?.forEach((p) => {
//     if (p.Head && !requested.get(p.UID)) {
//       requested.set(p.UID, true);
//       // commitEventID = GetCommitEventID(p.Head)
//       let filter: NDKFilter = {
//         "#e": [p.UID],
//       };
//       fetchEventsAndUpsertStore(filter, problemEvents);
//     }
//   });
// });

//todo make a new Problem object which contains a nested tree of problems.
//0. sort all problems by ID
//1. iterate and add all problems with no parents to the tree, iterate again and add problems with parents under their parent. Pop from list each time.
//3. continue until the length of the list doesn't change.
//4. repeat every time we get a new Problem to the main problem map.
//problem: problems can have multiple parents. solution: make the tree a list of ID's and fetch the event from the main problem map each time rather than copying it.
