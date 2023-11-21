import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Nostrocket } from "../types";
import { Handle1031 } from "./rockets";
import type { ConsensusMode } from "./types";

export function HandleHardStateChangeRequest(
  ev: NDKEvent,
  state: Nostrocket,
  consensusMode: ConsensusMode
):Error|null {
  switch (ev.kind) {
    case 1031:
    case 15171031:
      return Handle1031(ev, state, {ConsensusMode:consensusMode});
  }
  return new Error("don't know how to handle that event kind");
}
