import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";
import { get } from "svelte/store";

export function getRocket(pr: Problem, state: Nostrocket) {
  return state.RocketMap.get(pr.Rocket);
}

export function getParents(pr: Problem, state: Nostrocket) {
  if (pr) {
    let parentSet = new Set<Problem>();
    for (let p of pr.Parents) {
      let parentProblem = state.Problems.get(p);
      if (parentProblem) {
        parentSet.add(parentProblem);
      }
    }
    return [...parentSet];
  }
}

export function getFirstParent(problem: Problem, state: Nostrocket) {
  let p = getParents(problem, state);
  if (p) {
    return p[0];
  }
}

export function cleanProblemTitle(title: string): string {
  let clean = title
    .replace("Problem:", "")
    .replace("problem:", "")
    .replace(/\.$/, "")
    .trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function removeSpiuriousChildren(state:Nostrocket) {
  for (let [_, problem] of state.Problems) {
    for (let child of problem.FullChildren) {
      if (!child.Parents.has(problem.UID)) {
        problem.FullChildren.delete(child)
      }
    }
  }

}