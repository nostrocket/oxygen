import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import { changeStateMutex } from "../mutex";
import { ndk } from "$lib/stores/event_sources/relays/ndk";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { Nostrocket, Problem } from "../types";
import { Mutex } from "async-mutex";
import { initLiveSubscriptions } from "$lib/stores/event_sources/relays/livesubscriptions";

//export let Problems: Readable<Problem[]>;
export let problemEvents = writable<Map<string, NDKEvent>>(new Map());

let cts:Writable<Nostrocket> = writable();
const requested = new Map();
const $ndk = get(ndk);
var initMu = new Mutex()

export function initProblems(consensusTipState:Writable<Nostrocket>) {
  initMu.acquire().then(()=>{
    cts = consensusTipState
  // Problems = derived(cts, ($nr) => {
  //   let problems: Problem[] = [];
  //   $nr.Problems.forEach((p) => {
  //     if (p.Head) {
  //       problems.push(p);
  //     }
  //   });
  //   //return $nr.Problems
  //   return problems;
  // });

  // let [filter, subscription] = initLiveSubscriptions()
  // filter.update(f=>{
  //   f.ids
  // })

  let [filter, subsription] = initLiveSubscriptions()
  subsription.subscribe(e=>{
    if (e[0]) {
      console.log(e[0])
      problemEvents.update(pe=>{
        if (!pe.get(e[0].id)) {
          pe.set(e[0].id, e[0])
        }
        return pe
      })
    }
  })

  cts.subscribe((state) => {
    state.Problems?.forEach((p) => {
      if (p.Head && !requested.get(p.UID)) {
        requested.set(p.UID, true);
        // commitEventID = GetCommitEventID(p.Head)
        let filter: NDKFilter = {
          "#e": [p.UID],
        };
        fetchEventsAndUpsertStore(filter, problemEvents);
      }
    });
  });

  problemEvents.subscribe(() => {
    changeStateMutex().then((release) => {
      cts.update((state) => {
        state.Problems.forEach((problem) => {
          //get the commit event and popuate status etc
          if (problem.Head) {
            let commitID = labelledTag(problem.Head, "commit", "e");
            if (commitID) {
              let commitEvent = getProblemEvent(commitID); //get(problemEvents).get(commitID)
              if (!commitEvent) {filter.update(f=>{
                if (!f.ids?.includes(commitID!)) {
                  f.ids?.push(commitID!)
                }
                return f
              })}
              if (commitEvent) {
                let s = commitEvent.tagValue("s");
                if (s) {
                  problem.Status = s;
                }
                let previous = labelledTag(commitEvent, "previous", "e");
                if (previous) {
                  if (!problem.CommitHistory) {
                    problem.CommitHistory = [];
                  }
                  if (!problem.CommitHistory.includes(previous)) {
                    problem.CommitHistory.push(previous);
                  }
                }
                let textEventID = labelledTag(commitEvent, "text", "e");
                if (textEventID) {
                  let textEvent = getProblemEvent(textEventID);
                  if (!textEvent) {
                    console.log(95)
                    filter.update(f=>{
                    if (!f.ids?.includes(textEventID!)) {
                      if (!f.ids) {
                        f.ids = []
                      }
                      console.log(98, textEventID)
                      f.ids?.push(textEventID!)
                    }
                    console.log(101, f)
                    return f
                  })}
                  if (textEvent) {
                    let title = labelledTag(textEvent, "title", "t");
                    if (title) {
                      problem.Title = title.length <= 100 ? title : problem.Title;
                    }
                    let summary = labelledTag(textEvent, "summary", "t");
                    if (summary) {
                      problem.Summary =
                        summary.length <= 280 ? summary : problem.Summary;
                    }
                    let fulltext = labelledTag(textEvent, "full", "t");
                    if (fulltext) {
                      problem.FullText = fulltext;
                    }
                  }
                }
              }
            }
            //get the text event
            //populate text content
          }
        });
        return state;
      });
      release();
    });
  });
  })
}





function getProblemEvent(id: string): NDKEvent | undefined {
  let e = get(problemEvents).get(id);
  if (e) {
    return e;
  } else if (!requested.get(id)) {
    fetchEventsAndUpsertStore({ ids: [id] }, problemEvents);
  }
}





// export async function fetchProblemEvents(id: string | undefined) {
//   if (id) {
//     if (!get(problemEvents).get(id) && !requested.get(id)) {
//       requested.set(id, true);
//       fetchEventsAndUpsertStore({ ids: [id] }, problemEvents);
//     }
//   } else {
//     // consensusTipState.subscribe((state) => {
//     //   state.Problems?.forEach((p) => {
//     //     if (p.Head && !requested.get(id)) {
//     //       requested.set(p.UID, true);
//     //       // commitEventID = GetCommitEventID(p.Head)
//     //       let filter: NDKFilter = {
//     //         "#e": [p.UID],
//     //       };
//     //       fetchEventsAndUpsertStore(filter, problemEvents);
//     //     }
//     //   });
//     // });
//   }
// }
//"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
async function fetchEventsAndUpsertStore(
  filter: NDKFilter,
  store: Writable<Map<string, NDKEvent>>
) {
  let sub = $ndk.storeSubscribe<NDKEvent>(filter, { closeOnEose: true });
  sub.subscribe((e) => {
    if (e[0]) {
      if (!get(problemEvents).get(e[0].id)) {
        problemEvents.update((state) => {
          state.set(e[0].id, e[0]);
          return state;
        });
      }
    }
  });
}




