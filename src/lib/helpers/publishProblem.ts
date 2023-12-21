import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
import { HandleProblemEvent } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
import type {
  Nostrocket,
  Problem,
  Rocket,
} from "$lib/stores/nostrocket_state/types";
import { get } from "svelte/store";
import { NewRocketProblem } from "../../settings";
import makeEvent from "./eventMaker";

export async function publishProblem(state: Nostrocket, problem: Problem) {
  //todo: return a promise
  if (problem.Parents.size == 0) {
    problem.Parents.add(NewRocketProblem);
  }
  if (!problem.Rocket) {
    let firstParent = state.Problems.get(
      problem.Parents.entries().next().value
    );
    if (!firstParent) {
      throw new Error("could not find a parent for this problem");
    }
    if (!firstParent.Rocket) {
      throw new Error("parent does not have a rocket");
    }
    problem.Rocket = firstParent.Rocket;
  }

  let e = makeEvent({
    kind: 1971,
    rocket: problem.Rocket, //todo: check parent problem's rocket and use that here
  });
  e.tags.push(["text", problem.Title, "tldr"]);
  if (problem.Summary) {
    e.tags.push(["text", problem.Summary, "paragraph"]);
  }
  if (problem.FullText) {
    e.tags.push(["text", problem.FullText, "page"]);
  }
  for (let parent of problem.Parents) {
    e.tags.push(["e", parent, "", "parent"]);
  }
  if (!problem.UID) {
    e.tags.push(["new"]);
  }
  if (problem.UID) {
    e.tags.push(["e", problem.UID, "", "problem"]);
  }
  e.tags.push(["status", "open"]);
  e.tags.push(["alt", "[ " + problem.Title + " ]" + problem.Summary]);
  e.content =
    "[ " +
    problem.Title +
    " ]" +
    problem.Summary +
    " read more using a Nostrocket client.";

  let err = HandleProblemEvent(e, state.Copy());
  if (err != undefined) {
    console.log(err);
    return;
  }
  e.publish()
    .then((x) => {
      console.log(e.rawEvent(), x);
    })
    .catch((err) => {
      console.log(e);
      throw new Error("failed to publish Problem event. " + err);
    });
}


export function UpdateStatus(problem:Problem, newStatus: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!problem) {
      reject("problem is missing");
    }
    let e = makeEvent({ kind: 1972 });
    e.tags.push(["e", problem!.UID, "problem"]);
    e.tags.push(["status", newStatus]);
    let err = HandleProblemEvent(e, get(consensusTipState).Copy());
    if (err != undefined) {
      reject(err);
    } else {
      e.publish()
        .then(() => {
          console.log(e);
          resolve("published");
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}