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
import { nostrocketIgnitionEvent, relayHint, rootProblem, simulateEvents } from "../../settings";
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

export function PublishProblem(
  problem: Problem,
  parent: Problem | Problem[],
  rocket?: Rocket
): Promise<NDKEvent> {
  return new Promise((resolve, reject) => {
    if (!parent) {
      reject("could not find parent");
    }
    if (!Array.isArray(parent)) {
      parent = [parent];
    }
    if (parent.length == 0 && problem.UID != rootProblem) {
      reject("could not find parent");
    }

    let e = makeEvent({
      kind: 1971,
      //rocket: rocket ? rocket.UID : parent[0].Rocket,
    });
    let pushed = new Set();
    for (let p of parent) {
      if (!pushed.has(p.Rocket)) {
        pushed.add(p.Rocket);
        e.tags.push(["e", p.Rocket, relayHint, "rocket"]);
      }
      if (!pushed.has(p.UID)) {
        pushed.add(p.UID);
        e.tags.push(["e", p.UID, relayHint, "parent"]);
      }
    }
    if (rocket) {
      if (!pushed.has(rocket.UID)) {
        e.tags.push(["e", rocket.UID, relayHint, "rocket"]);
      }
    }

    if (problem.UID == rootProblem && !rocket) {
      e.tags.push(["e", nostrocketIgnitionEvent, relayHint, "rocket"])
    }
    e.tags.push(["text", problem.Title, "tldr"]);
    if (problem.Summary) {
      e.tags.push(["text", problem.Summary, "paragraph"]);
    }
    if (problem.FullText) {
      e.tags.push(["text", problem.FullText, "page"]);
    }
    if (!problem.UID || problem.UID?.length != 64) {
      e.tags.push(["new"]);
    }
    if (problem.UID) {
      e.tags.push(["e", problem.UID, relayHint, "problem"]);
    }

    e.tags.push(["status", problem.Status]);
    e.tags.push(["alt", "This is a Nostrocket problem"]);
    e.content =
      "[ " +
      problem.Title +
      " ]" +
      (problem.Summary ? problem.Summary : "") +
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
          resolve(e);
        })
        .catch((err) => {
          console.log(err, e);
          reject("failed to publish Problem event. " + err);
        });
    } else {
      e.sign().then(() => {
        console.log("simulation mode, not publishing events");
        resolve(e);
      });
    }
  });
}
