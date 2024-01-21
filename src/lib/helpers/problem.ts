import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
import {
  HandleProblemEvent,
  hasOpenChildren,
} from "$lib/stores/nostrocket_state/soft_state/problems";
import type {
  Nostrocket,
  Problem,
  Rocket,
} from "$lib/stores/nostrocket_state/types";
import { get } from "svelte/store";
import makeEvent from "./eventMaker";
import { simulateEvents } from "../../settings";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export function problemStatus(problem: Problem, state: Nostrocket) {
  if (problem?.Status === "open" && hasOpenChildren(problem, state)) {
    return "openChildren";
  }

  if (problem?.Status === "open" && !hasOpenChildren(problem, state)) {
    return "open";
  }

  return problem.Status;
}

export function PublishProblem(newProblem: Problem, parent: Problem, rocket?: Rocket):Promise<NDKEvent> {
  return new Promise((resolve, reject) => {
    if (!parent) {
      reject("could not find parent");
    }
    let e = makeEvent({
      kind: 1971,
      rocket: rocket ? rocket.UID : parent.Rocket,
    });
    e.tags.push(["text", newProblem.Title, "tldr"]);
    if (newProblem.Summary) {
      e.tags.push(["text", newProblem.Summary, "paragraph"]);
    }
    if (newProblem.FullText) {
      e.tags.push(["text", newProblem.FullText, "page"]);
    }
    e.tags.push(["e", parent.UID, "", "parent"]);
    e.tags.push(["new"]);

    e.tags.push(["status", "open"]);
    e.tags.push(["alt", "This is a Nostrocket problem"]);
    e.content =
      "[ " +
      newProblem.Title +
      " ]" +
      (newProblem.Summary ? newProblem.Summary : "") +
      " read more using a client that supports Nostrocket problem tracking.";

    let err = HandleProblemEvent(e, get(consensusTipState).Copy());
    if (err != undefined) {
      console.log(err);
      return;
    }
    if (!simulateEvents) {
      e.publish()
        .then((x) => {
          console.log(e.rawEvent(), x);
          resolve(e)
        })
        .catch((err) => {
          console.log(err, e);
         reject("failed to publish Problem event. " + err);
        });
    } else {
      e.sign().then(() => {
        console.log("simulation mode, not publishing events")
        resolve(e)
      });
    }
  });
}
