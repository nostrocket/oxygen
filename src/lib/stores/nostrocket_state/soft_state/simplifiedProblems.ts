import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nostrocketIgnitionEvent } from "../../../../settings";
import { Problem, type Nostrocket } from "../types";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";

export function HandleProblemEvent(ev:NDKEvent, state:Nostrocket):boolean {
    let success = false
    if (ev.getMatchingTags("new").length > 0) {
        success = handleNewProblemEvent(ev, state)
    }
    if (labelledTag(ev, "problem", "e")) {
        success = handleProblemModification(ev, state)
    }
    return success
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