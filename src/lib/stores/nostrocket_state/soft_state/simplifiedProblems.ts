import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nostrocketIgnitionEvent } from "../../../../settings";
import { Problem, type Nostrocket } from "../types";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";

export function HandleProblemEvent(ev:NDKEvent, state:Nostrocket):boolean {
    let success = false
    switch (ev.kind) {
        case 1971:
            if (ev.getMatchingTags("new").length > 0) {
                success = handleNewProblemEvent(ev, state)
            }
            if (labelledTag(ev, "problem", "e")) {
                success = handleProblemModification(ev, state)
            }
            break;
        case 1972:
           let [err, s] = handleProblemStatus(ev, state)
           success = s
    }

    return success
}

function handleProblemStatus(ev:NDKEvent, state:Nostrocket):[string, boolean] {
    let success = false
    let error = ""
    if (!state.Problems) {
      state.Problems = new Map<string, Problem>();
    }
    let problemID = labelledTag(ev, "problem", "e")
    let statusTag = ev.getMatchingTags("status")
    let newStatus = statusTag[0][1] //todo try/catch or some javascripty way to handle error
    if (!statusTag) {error = "could not find a status update tag"}
    if (problemID) {
        let problem = state.Problems.get(problemID)
        if (problem) {
            if (!problem) {
                error = "problem is missing"
            }
            if (!state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)) {
                error = "current user is not in the Identity Tree"
            }
            if (newStatus == "claimed" && problem?.Status != "open") {
                error = "cannot claim a problem that isn't open"
            }
            if (newStatus == "close" && problem?.CreatedBy != ev.pubkey) {
                //todo also check if maintainer
                error = "you cannot close a problem unless you are the creator of it or a maintainer on its rocket"
            }
            if (newStatus == "patched" && (problem?.Status !== "claimed" || problem?.ClaimedBy != ev.pubkey)) {
                error = "you cannot mark this problem as patched unless you are the one who claimed it"
            }
            if (error == "") {
                problem.Status = newStatus
                success = true
            }
        }
    }
    return [error, success]
}

function handleNewProblemEvent(ev:NDKEvent, state:Nostrocket):boolean {
    let success = false
    if (!state.Problems) {
      state.Problems = new Map<string, Problem>();
    }
    if (!state.Problems.get(ev.id) && ev.getMatchingTags("new").length > 0) {
      if (state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)) {
        let p = new Problem();
        if (p.UID?.length !== 64) {
            p.UID = ev.id;
            p.CreatedBy = ev.pubkey;
            if (updateProblemFromEvent(ev, p, state)) {
                p.Events.push(ev.rawEvent())
                state.Problems.set(p.UID, p);
                populateChildren(p, state)
                success = true
            }
          }
      }
    }
    return success
}

function handleProblemModification(ev:NDKEvent, state:Nostrocket):boolean {
    let success = false
    if (!state.Problems) {
      state.Problems = new Map<string, Problem>();
    }
    if (ev.getMatchingTags("new").length == 0) {
        let problemID = labelledTag(ev, "problem", "e")
        if (problemID?.length == 64) {
            let existing = state.Problems.get(problemID)
            if (existing) {
                //todo check bitcoin height and hash
                if (existing.LastUpdateUnix < ev.created_at! && existing.CreatedBy == ev.pubkey || false) { //todo replace `false` with check if maintainer
                    if (updateProblemFromEvent(ev, existing, state)) {
                        existing.Events.push(ev.rawEvent())
                        state.Problems.set(problemID, existing)
                        populateChildren(existing, state)
                        success = true
                    }

                }
            }
        }
    }
    return success
}

function updateProblemFromEvent(ev:NDKEvent, existing:Problem, state:Nostrocket):boolean {
    let problem = new Problem
    let success = false
    let tldr = labelledTag(ev, "tldr", "text")
    if (tldr!.length > 15) {
        problem.Title = tldr!
    }
    let paragraph = labelledTag(ev, "paragraph", "text")
    if (paragraph!.length > 20) {problem.Summary = paragraph!}
    let page = labelledTag(ev, "page", "text")
    problem.FullText = page!
    ev.getMatchingTags("e").forEach(tag=>{
        if (tag[tag.length-1] == "parent") {
            if (tag[1].length == 64) {
                problem.Parents.add(tag[1])
            }
        }
    })
    problem.Status = labelledTag(ev, "", "status")!

    let rocket = labelledTag(ev, "rocket", "e")
    if (rocket) {
        if (state.RocketMap.get(rocket)) {
            problem.Rocket = rocket
        }
    }
    //todo handle labels

    //now we validate the modified date in the context of the existing data
    if (problem.Title && problem.Summary && problem.Status && problem.Rocket) {
        //todo validate that this user is a maintainer on both rockets if the rocket has changed
        existing.FullText = problem.FullText;
        existing.LastUpdateUnix = ev.created_at!
        existing.Parents = problem.Parents
        existing.Status = problem.Status
        existing.Rocket = problem.Rocket
        existing.Title = problem.Title
        existing.Summary = problem.Summary
        success = true
    }
    return success
}

function populateChildren(problem:Problem, state:Nostrocket) {
    problem.Parents.forEach(parent=>{
        let parentProblem = state.Problems.get(parent)
        if (parentProblem) {
            parentProblem.Children.add(problem.UID)
        }
    })
}


//// Legacy stuff for reference, leave here for G to delete:
// function updateProblemWithNewHead(
//     current: Problem,
//     h: NDKEvent,
//     state: Nostrocket
//   ): [Problem, boolean] {
//     let p = structuredClone(current);
//     p.Head = h;
//     p.Head.getMatchingTags("s").forEach((s) => {
//       if (s[1].length > 0) {
//         if (
//           s[1] == "open" ||
//           s[1] == "closed" ||
//           s[1] == "claimed" ||
//           s[1] == "patched" ||
//           s[1] == "solved"
//         ) {
//           p.Status = s[1];
//         }
//       }
//     });
//     p.Head.getMatchingTags("h").forEach((h) => {
//       if (h[1].includes(":")) {
//         let hs = h[1].split(":");
//         let height = parseInt(hs[0], 10);
//         if (height) {
//           p.LastHeadHeight = height;
//         }
//         if (hs[1].length == 64) {
//           p.LastHeadHash = hs[1];
//         }
//       }
//     });
//     p.Head.getMatchingTags("e").forEach((e) => {
//       if (e[e.length - 1] == "parent") {
//         if (e[1].length == 64) {
//           if (!p.Parents) {
//             p.Parents = new Set();
//           }
//           p.Parents.add(e[1]);
//         }
//       }
//       if (e[e.length - 1] == "commit") {
//         if (e[1].length == 64) {
//           p.LastCommit = e[1];
//         }
//       }
//       if (e[e.length - 1] == "rocket") {
//         if (e[1].length == 64) {
//           if (p.Rocket !== e[1]) {
//             let r = state.RocketMap.get(e[1]);
//             if (r) {
//               //todo make sure that when we add maintainers, we are creating keys for each person added in the event
//               if (
//                 r.Maintainers.get(h.pubkey) ||
//                 e[1] == nostrocketIgnitionEvent
//               ) {
//                 p.Rocket = e[1];
//               }
//             }
//           }
//         }
//       }
//     });
//     if (p.Parents) {
//       p.Parents.forEach((prnt) => {
//         let parentProblem = state.Problems.get(prnt);
//         if (parentProblem) {
//           if (!parentProblem.Children) {
//             parentProblem.Children = new Set();
//           }
//           parentProblem.Children.add(p.UID);
//         }
//       });
//     }
//     if (!p.Rocket) {
//       p.Rocket = nostrocketIgnitionEvent;
//     }
//     let success = true;
//     if (p.LastCommit && p.LastHeadHash && p.LastHeadHeight && p.Status) {
//       if (
//         !(
//           p.Rocket !== current.Rocket ||
//           p.Status !== current.Status ||
//           p.LastCommit !== current.LastCommit
//         )
//       ) {
//         success = false;
//       }
//     } else {
//       success = false;
//     }
//     //validate the problem has changed, and that the changes are valid
//     return [p, success];
//   }
  
  
  
//   function newProblemAnchorEvent(
//     ev: NDKEvent,
//     state: Nostrocket
//   ): [Nostrocket, boolean] {
//     let success = false
//     if (!state.Problems) {
//       state.Problems = new Map<string, Problem>();
//     }
//     if (!state.Problems.get(ev.id)) {
//       if (
//         state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)
//       ) {
//         let p = new Problem();
//         if (p.populateFromEvent(ev)) {
//           state.Problems.set(p.UID, p);
//           success = true
//         }
//       }
//     }
//     return [state, success];
//   }
  
  