import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Nostrocket } from "../types";
import { TypeOfFailure, type ConsensusMode } from "./types";
import { HandleRocketIgnitionNote } from "./rockets";

export function HandleHardStateChangeRequest(
  ev: NDKEvent,
  state: Nostrocket,
  consensusMode: ConsensusMode
): [Nostrocket, TypeOfFailure, boolean] {
  switch (ev.kind) {
    case 15171031:
      return HandleRocketIgnitionNote(ev, state, consensusMode);
  }
  return [state, TypeOfFailure.HardStateFailure, false];
}
