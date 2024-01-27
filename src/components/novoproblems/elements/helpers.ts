import { currentUser } from "$lib/stores/hot_resources/current-user";
import { consensusTipState, nostrocketMaintiners } from "$lib/stores/nostrocket_state/master_state";
import type { Nostrocket, Problem, Rocket } from "$lib/stores/nostrocket_state/types";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { derived, get, type Readable, type Writable } from "svelte/store";

export function getRocket(pr: Problem, state: Nostrocket) {
  if (pr && state) {
    return state.RocketMap.get(pr.Rocket);
  }
}

export function getParents(pr: Problem, state: Nostrocket) {
  if (pr && state) {
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

export function CurrentUserCanModify(currentUser: Writable<NDKUser | undefined>, rocket: Readable<Rocket | undefined>, nostrocketMaintiners: Readable<string[]>, problem:Problem):Readable<boolean> {
  return derived(
    [currentUser, rocket, nostrocketMaintiners],
    ([$currentUser, $rocket, $nostrocketMaintainers]) => {
      if ($currentUser && $rocket && $nostrocketMaintainers) {
        if ($currentUser.pubkey == $rocket.CreatedBy) {
          return true;
        }
        if ($currentUser.pubkey == problem.CreatedBy) {
          return true;
        }
        if ($rocket.isMaintainer($currentUser.pubkey)) {
          return true;
        }
        if ($nostrocketMaintainers.includes($currentUser.pubkey)) {
          return true;
        }
      }
      return false;
    }
  );
}
