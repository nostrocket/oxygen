import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";
import { nostrocketIgnitionEvent, rootProblem } from "../../../../settings";
import { consensusTipState } from "../master_state";
import { Problem, type Nostrocket } from "../types";
import { cleanProblemTitle } from "../../../../components/novoproblems/elements/helpers";
import { Mutex } from "async-mutex";
import type NDK from "@nostr-dev-kit/ndk";

export function HandleProblemEvent(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  // if (!state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)) {
  //   //console.log(14, ev)
  //   return "pubkey not in identity tree";
  // }
  for (let [_, problem] of state.Problems) {
    populateChildren(problem, state);
  }
  switch (ev.kind) {
    case 1971:
      if (ev.getMatchingTags("new").length > 0) {
        return handleProblemCreation(ev, state);
      }
      if (labelledTag(ev, "problem", "e")) {
        return handleProblemModification(ev, state);
      }
      break;
    case 1972:
      return handleProblemStatusChangeEvent(ev, state);
  }
  return "invalid problem event";
  //throw new Error("invalid problem event");
}

function handleProblemStatusChangeEvent(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  if (!state.Problems) {
    state.Problems = new Map<string, Problem>();
  }
  let problemID = labelledTag(ev, "problem", "e");
  // if (problemID == "734f43e42ac0db49e0b5c16f16384a9cb3b061ba9afa4253873f4c999c802d4f") {
  //   console.log(46, ev.id)
  // }
  let statusTag = ev.getMatchingTags("status");
  let newStatus = statusTag[0][1]; //todo: try/catch or some javascriptard way to handle error
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
  problem.Nempool.set(ev.id, ev)
  if (
    problem.LastUpdateUnix >= ev.created_at! ||
    problem.EventsInState[problem.EventsInState.length - 1].created_at >= ev.created_at!
  ) {
    return replayEvents(problem, ev, state);
    //return "this event is too old";
  }
  if (newStatus == "claimed" && problem!.Status != "open") {
    return "cannot claim a problem that isn't open";
  }
  if (newStatus == "close" && problem!.CreatedBy != ev.pubkey) {
    //todo: also check if maintainer
    return "you cannot close a problem unless you are the creator of it or a maintainer on its rocket";
  }

  if (newStatus == "closed" && problem.Status == "closed") {
    return "you cannot close a problem that is already closed";
  }

  if (newStatus == "closed") {
    for (let [_, c] of problem.FullChildren) {
      //if (!child) {return "could not find child problem " + c + ". To prevent catastrophe, you can't close this."}
      if (c.Status != "closed") {
        return (
          "you must close the sub-problem " +
          c +
          " before you can close this problem"
        );
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
    if (hasOpenChildren(problem, state)) {
      return "this problem has open children, it cannot be claimed";
    }
    for (let [s, p] of state.Problems) {
      if (p.Status == "claimed" && p.ClaimedBy == ev.pubkey) {
        return (
          "this pubkey has claimed " +
          p.UID +
          ". Abandon or solve that first before claiming another problem."
        );
      }
    }
  }

  if (newStatus == "open" && problem!.Status == "open") {
    return "this problem is already open";
  }

  if (
    newStatus == "open" &&
    problem!.Status == "claimed" &&
    problem.ClaimedBy != ev.pubkey
  ) {
    return "you cannot abandon a problem that you haven't claimed";
  }

  // if (
  //   problem.LastUpdateUnix >= ev.created_at! ||
  //   problem.EventsInState[problem.EventsInState.length - 1].created_at >= ev.created_at!
  // ) {
  //   return replayEvents(problem, ev, state);
  //   //return "this event is too old";
  // }

  problem.Status = newStatus;
  if (newStatus == "claimed") {
    problem.ClaimedBy = ev.pubkey;
    problem.ClaimedAt = ev.created_at!;
  }
  problem.Pubkeys.add(ev.pubkey);
  problem.EventsInState.push(ev);
  return undefined;
}

function handleProblemCreation(
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {
  let p = new Problem();
  if (state.Problems.get(ev.id)) {
    p = state.Problems.get(ev.id)!;
    //return "this problem already exists";
  }
  p.Nempool.set(ev.id, ev)
  p.UID = ev.id;
  p.CreatedBy = ev.pubkey;
  p.Pubkeys.add(ev.pubkey);
  let err = eventToProblemData(ev, p, state);
  if (err != undefined) {
    return err;
  }
  // for (let id of p.Parents) {
  //   if (state.Problems.get(id)?.Status != "open") {
  //     return "cant create a problem on a parent that isn't open";
  //   }
  // }
  p.EventsInState.push(ev);
  state.Problems.set(p.UID, p);
  populateChildren(p, state);
  //console.log(p.UID)
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
  if (problemID.length != 64) {
    return "invalid problem ID";
  }
  let existing = state.Problems.get(problemID);
  if (existing) {
    existing.Nempool.set(ev.id, ev)
    if (
      existing.CreatedBy != ev.pubkey &&
      !state.RocketMap.get(nostrocketIgnitionEvent)!.isMaintainer(ev.pubkey)
    ) {
      return "pubkey is not the creator of this problem and not a maintainer on this rocket";
      // throw new Error(
      //   "pubkey is not the creator of this problem and not a maintainer on this rocket"
      // );
    }
    existing.EventsInState.sort((a, b) => {
      return a.created_at - b.created_at;
    });
    if (
      existing.EventsInState[existing.EventsInState.length - 1].created_at > ev.created_at!
    ) {
      //if (ev.id == "fef6eadd1644bf211ccdecd5f365d8a7c7b836e58a3edb07bf3c6e990d7109b4") {console.log(208)}
      return replayEvents(existing, ev, state);
      //throw new Error("we already have a newer event")
    }
    existing.Pubkeys.add(ev.pubkey);

    if (
      existing.EventsInState[existing.EventsInState.length - 1].created_at < ev.created_at!
    ) {
      let err = eventToProblemData(ev, existing, state);
      if (err != undefined) {
        return err;
      }
    }
    existing.EventsInState.push(ev);
    state.Problems.set(problemID, existing);
    populateChildren(existing, state);
  }
  if (!existing) {
    return "problem does not exist yet";
    // if (ev.id == "00762e865330d3fb182c8d37a71e69da55e6a37e286429bc4e3b6c4c13bc3b5f") {console.log(204)}
    // let _temp: Problem = new Problem();
    // let err = eventToProblemData(ev, _temp, state);
    // if (err != undefined) {
    //   throw new Error(err);
    // }
    // state.Problems.set(problemID, _temp);
    // populateChildren(_temp, state);
  }
  // if (existing.LastUpdateUnix >= ev.created_at!) {
  //   return "this event is too old";
  // }
  // if (
  //   existing.Events[existing.Events.length - 1].created_at >= ev.created_at!
  // ) {
  //   return "this event is too old";
  // }
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
  tldr = cleanProblemTitle(tldr);
  let paragraph = labelledTag(ev, "paragraph", "text");
  if (paragraph) {
    if (paragraph!.length > 280) {
      return "paragraph is too long";
    }
  }
  let page = labelledTag(ev, "page", "text");
  page ? (existing.FullText = page) : undefined;

  existing.Parents = new Set();
  parentTagsToProblemData(ev, existing);
  if (existing.Parents.size == 0 && existing.UID != rootProblem) {
    return "problem does not have a parent";
  }
  let status = labelledTag(ev, "", "status")!;
  if (!status) {
    return "no status tag found";
  }

  let rocket = labelledTag(ev, "rocket", "e");
  if (rocket?.length != 64 && existing.UID != nostrocketIgnitionEvent) {
    console.log(ev);
    return "invalid rocket tag " + rocket;
  }
  if (!rocket) {
    rocket = nostrocketIgnitionEvent;
  }
  if (existing.EventsInState.includes(ev)) {
    return "event is already included";
  }
  let currentRocket = state.RocketMap.get(rocket);
  if (currentRocket) {
    currentRocket.Problems.add(existing.UID);
    state.RocketMap.set(currentRocket.UID, currentRocket);
  }
  existing.Title = tldr!;
  existing.Summary = paragraph!;
  existing.Status = status;
  if (!existing.Rocket) {
    existing.Rocket = rocket;
  } //todo: there's a bug that manifests if we change the primary rocket associated with a problem, this (preventing rockets from being changed) is a shitty way that fixes it for now but we should do better.
  //existing.Rocket = rocket;
  for (let [s, r] of state.RocketMap) {
    if (r.CreatedBy == existing.CreatedBy && r.ProblemID == existing.UID) {
      existing.Rocket = r.UID;
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
      for (let [_, child] of parentProblem.FullChildren) {
        if (!child.Parents.has(parentProblem.UID)) {
          parentProblem.FullChildren.delete(child.UID);
        }
      }
      parentProblem.FullChildren.set(problem.UID, problem);
    }
  }
}

export function hasOpenChildren(problem: Problem, state: Nostrocket): boolean {
  if (!state) {
    state = get(consensusTipState);
  }
  for (let [_, child] of problem.FullChildren) {
    if (child.Status != "closed" && child.Parents.has(problem.UID)) {
      return true;
    }
  }
  return false;
}

const attemptedReplays = new Map<string, string>()

function replayEvents(
  problem: Problem,
  ev: NDKEvent,
  state: Nostrocket
): string | undefined {


    let replayCheck = [...problem.EventsInState].toSorted((a, b) => {
      return a.created_at! - b.created_at!;
    });
    if (attemptedReplays.has(ev.id)) {
      if (attemptedReplays.get(ev.id) == replayCheck[replayCheck.length-1].id) {
        if (ev.id == "fef6eadd1644bf211ccdecd5f365d8a7c7b836e58a3edb07bf3c6e990d7109b4") {console.log(364)}
        return "event is too old, and already attempted this replay"
      }
    }
    // if (problem.Nempool.has(ev.id)) {
    //   return "event is too old, and already attempted this replay"
    // }
    // problem.Nempool.set(ev.id, ev)
    let _e:NDKEvent[] = []
    for (let [_, e] of [...problem.Nempool].toSorted(([_a, a], [_b, b]) => {
      return a.created_at! - b.created_at!;
    })) {
      _e.push(e)
    }
    
    //attemptedReplays.set(ev.id, _e[_e.length-1].id)
    let _problem = state.Problems.get(problem.UID)
    state.Problems.delete(problem.UID)
    let returnError = undefined
    //if (ev.id == "fef6eadd1644bf211ccdecd5f365d8a7c7b836e58a3edb07bf3c6e990d7109b4") {console.log(_e)}
    for (let e of _e) {
      let error = HandleProblemEvent(e, state);
      if (error && e.id == ev.id) {
        //if (ev.id == "fef6eadd1644bf211ccdecd5f365d8a7c7b836e58a3edb07bf3c6e990d7109b4") {console.log(388)}    
        returnError = error
        //return error
      }
    }
    if (!_problem) {console.log(368)}
    if (returnError) {state.Problems.set(_problem!.UID, _problem!)}
    return returnError
}
