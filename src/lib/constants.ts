import type { ProblemStatus } from "$lib/stores/nostrocket_state/types";

export const problemStatuses: Map<string, ProblemStatus> = new Map(
  ["open", "claimed", "closed", "patched", "solved"].map((v) => [
    v,
    v as ProblemStatus,
  ])
);
