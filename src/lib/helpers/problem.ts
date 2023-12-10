import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";

export function problemStatus(problem: Problem, state:Nostrocket) {
    if (
      problem?.Status === "open" &&
      hasOpenChildren(problem, state)
    ) {
      return "openChildren";
    }

    if (
      problem?.Status === "open" &&
      !hasOpenChildren(problem, state)
    ) {
      return "open";
    }

    return problem.Status;
  };