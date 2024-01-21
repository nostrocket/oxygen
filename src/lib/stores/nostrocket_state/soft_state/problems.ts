import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";
import { nostrocketIgnitionEvent, rootProblem } from "../../../../settings";
import { consensusTipState } from "../master_state";
import { Problem, type Nostrocket } from "../types";

export function HandleProblemEvent(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  if (!state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)) {
    return "pubkey not in identity tree";
  }
  switch (ev.kind) {
    case 1971:
      if (ev.getMatchingTags("new").length > 0) {
        return handleProblemCreation(ev, state);
      }
      if (labelledTag(ev, "problem", "e")) {
        return handleProblemModification(ev, state);
      }
    case 1972:
      return handleProblemStatusChangeEvent(ev, state);
  }
  return "invalid event";
}

function handleProblemStatusChangeEvent(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  if (!state.Problems) {
    state.Problems = new Map<string, Problem>();
  }
  let problemID = labelledTag(ev, "problem", "e");
  let statusTag = ev.getMatchingTags("status");
  let newStatus = statusTag[0][1]; //todo: try/catch or some javascripty way to handle error
  if (!statusTag) {
    return "could not find a status update tag";
  }
  if (!problemID) {
    return "could not find problem tag";
  }
  let problem = state.Problems.get(problemID);
  if (!problem) {
    return "could not find Problem in current state";
  }
  if (newStatus == "claimed" && problem!.Status != "open") {
    return "cannot claim a problem that isn't open";
  }
  if (newStatus == "close" && problem!.CreatedBy != ev.pubkey) {
    //todo: also check if maintainer
    return "you cannot close a problem unless you are the creator of it or a maintainer on its rocket";
  }

  if (newStatus == "closed") {
    for (let c of problem.Children) {
      let child = state.Problems.get(c)
      if (!child) {return "could not find child problem " + c + ". To prevent catastrophe, you can't close this."}
      if (child?.Status != "closed") {
        return "you must close the sub-problem " +
        c + " before you can close this problem"
      }
    }
  }
  if (
    newStatus == "patched" &&
    (problem?.Status !== "claimed" || problem!.ClaimedBy != ev.pubkey)
  ) {
    return "you cannot mark this problem as patched unless you are the one who claimed it";
  }
  if (newStatus == "claimed") {
    if (hasOpenChildren(problem, state)) {return "this problem has open children, it cannot be claimed"}
    for (let [s,p] of state.Problems) {
      if (p.Status == "claimed" && p.ClaimedBy == ev.pubkey) {
        return (
          "this pubkey has claimed " + p.UID +
          ". Abandon or solve that first before claiming another problem."
        )}}}

  if (newStatus == "open" && problem!.Status == "open") {
    return "this problem is already open";
  }

  if (
    newStatus == "open" &&
    problem!.Status != "open" &&
    problem.ClaimedBy != ev.pubkey
  ) {
    return "you cannot abandon a problem that you haven't claimed";
  }

  if (problem.LastUpdateUnix >= ev.created_at!) {
    return "this event is too old";
  }
  if (problem.Events[problem.Events.length-1].created_at >= ev.created_at!) {
    return "this event is too old";
  }

  problem.Status = newStatus;
  if (newStatus == "claimed") {
    problem.ClaimedBy = ev.pubkey;
    problem.ClaimedAt = ev.created_at!
  }
  problem.Pubkeys.add(ev.pubkey)
  problem.Events.push(ev.rawEvent());
  return undefined
}

function handleProblemCreation(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  if (state.Problems.get(ev.id)) {
    return "this problem already exists";
  }
  let p = new Problem();
  p.UID = ev.id;
  p.CreatedBy = ev.pubkey;
  p.Pubkeys.add(ev.pubkey);
  let err = eventToProblemData(ev, p, state);
  if (err != undefined) {
    return err;
  }
  for (let id of p.Parents) {
    if (state.Problems.get(id)?.Status != "open") {
      return "cant create a problem on a parent that isn't open"
    }
  }
  p.Events.push(ev.rawEvent());
  state.Problems.set(p.UID, p);
  populateChildren(p, state);
  return undefined;
}

function handleProblemModification(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  if (ev.getMatchingTags("new").length != 0) {
    return "this is not a modification to an existing problem";
  }
  let problemID = labelledTag(ev, "problem", "e");
  if (!problemID) {
    return "could not find a tag containing problem ID";
  }
  let existingProblem = state.Problems.get(problemID);
  if (!existingProblem) {
    return "this problem does not exist";
  }
  if (problemID.length != 64) {
    return "invalid problem ID";
  }
  let existing = state.Problems.get(problemID);
  if (!existing) {
    return "could not find the tagged problem";
  }
  if (existing.LastUpdateUnix >= ev.created_at!) {
    return "this event is too old";
  }
  if (existing.Events[existing.Events.length-1].created_at >= ev.created_at!) {
    return "this event is too old";
  }
  if (
    existing.CreatedBy != ev.pubkey &&
    !state.RocketMap.get(nostrocketIgnitionEvent)!.isMaintainer(ev.pubkey)
  ) {
    return "pubkey is not the creator of this problem and not a maintainer on this rocket";
  }
  let err = eventToProblemData(ev, existing, state);
  if (err != undefined) {
    return err;
  }
  existing.Pubkeys.add(ev.pubkey)
  existing.Events.push(ev.rawEvent());
  state.Problems.set(problemID, existing);
  populateChildren(existing, state);
  return undefined;
}

function eventToProblemData(
  ev: NDKEvent,
  existing: Problem,
  state: Nostrocket
): string | undefined {
  //todo: check bitcoin height and hash
  let tldr = labelledTag(ev, "tldr", "text");
  if (!tldr) {
    return "no tldr found";
  }
  if (tldr!.length < 16) {
    return "tldr is too short";
  }
  let paragraph = labelledTag(ev, "paragraph", "text");
  if (paragraph) {
    if (paragraph!.length > 280) {
      return "paragraph is too long";
    }
  }
  let page = labelledTag(ev, "page", "text");
  page ? (existing.FullText = page) : undefined;

  parentTagsToProblemData(ev, existing);
  if (existing.Parents.size == 0 && existing.UID != rootProblem) {
    return "problem does not have a parent";
  }
  let status = labelledTag(ev, "", "status")!;
  if (!status) {
    return "no status tag found";
  }

  let rocket = labelledTag(ev, "rocket", "e");
  if (rocket?.length != 64) {
    return "invalid rocket tag";
  }
  if (!rocket) {
    rocket = nostrocketIgnitionEvent;
  }
  if (existing.Events.includes(ev.rawEvent())) {
    return "event is already included";
  }
  let currentRocket = state.RocketMap.get(rocket)
  if (currentRocket) {
    currentRocket.Problems.add(existing.UID)
    state.RocketMap.set(currentRocket.UID, currentRocket)
  }
  existing.Title = tldr!;
  existing.Summary = paragraph!;
  existing.Status = status;
  existing.Rocket = rocket;
  for (let [s, r] of state.RocketMap) {
    if (r.CreatedBy == existing.CreatedBy && r.ProblemID == existing.UID) {
      existing.Rocket = r.UID
    }
  }
  return undefined;
}

function parentTagsToProblemData(ev: NDKEvent, existing: Problem) {
  existing.Parents = new Set<string>();
  for (let tag of ev.getMatchingTags("e")) {
    if (tag[tag.length - 1] == "parent") {
      if (tag[1].length == 64) {
        existing.Parents.add(tag[1]);
      }
    }
  }
}

function populateChildren(problem: Problem, state: Nostrocket) {
  for (let parent of problem.Parents) {
    let parentProblem = state.Problems.get(parent);
    if (parentProblem) {
      parentProblem.Children.add(problem.UID);
      parentProblem.FullChildren.add(problem)
    }
  }
}

export function hasOpenChildren(problem:Problem, state:Nostrocket):boolean {
  if (!state) {state = get(consensusTipState)}
  for (let child of problem.Children) {
    if (state.Problems.get(child)?.Status != "closed") {return true}
  }
  return false
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
//               //todo: make sure that when we add maintainers, we are creating keys for each person added in the event
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


