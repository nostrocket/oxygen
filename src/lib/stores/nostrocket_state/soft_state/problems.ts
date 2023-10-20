import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { get, writable, type Writable } from "svelte/store";
import { consensusTipState, labelledTag } from "../../../consensus/state";
import { changeStateMutex } from "../mutex";
import ndk from "$lib/stores/event_sources/relays/ndk";

export const problemEvents = writable<Map<string, NDKEvent>>(new Map());

export function getProblemEvent(id: string): NDKEvent | undefined {
  let e = get(problemEvents).get(id);
  if (e) {
    return e;
  } else if (!requested.get(id)) {
    fetchEventsAndUpsertStore({ ids: [id] }, problemEvents);
  }
}
const $ndk = get(ndk);

const requested = new Map();

export async function fetchProblemEvents(id: string | undefined) {
  if (id) {
    if (!get(problemEvents).get(id) && !requested.get(id)) {
      requested.set(id, true);
      fetchEventsAndUpsertStore({ ids: [id] }, problemEvents);
    }
  } else {
    consensusTipState.subscribe((state) => {
      state.Problems?.forEach((p) => {
        if (p.Head && !requested.get(id)) {
          requested.set(p.UID, true);
          // commitEventID = GetCommitEventID(p.Head)
          let filter: NDKFilter = {
            "#e": [p.UID],
          };
          fetchEventsAndUpsertStore(filter, problemEvents);
        }
      });
    });
  }
}
//"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
export async function fetchEventsAndUpsertStore(
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

problemEvents.subscribe(() => {
  changeStateMutex().then((release) => {
    consensusTipState.update((state) => {
      state.Problems.forEach((problem) => {
        //get the commit event and popuate status etc
        if (problem.Head) {
          let commitID = labelledTag(problem.Head, "commit", "e");
          if (commitID) {
            let commitEvent = getProblemEvent(commitID); //get(problemEvents).get(commitID)
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
