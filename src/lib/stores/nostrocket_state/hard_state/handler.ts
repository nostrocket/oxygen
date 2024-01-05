import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Nostrocket } from "../types";
import { Handle1031 } from "./rockets";
import { ConsensusMode } from "./types";
import { Handle1602, Handle1603 } from "./merits";
import { nostrocketParticipants } from "../master_state";
import { get } from "svelte/store";

export function HandleHardStateChangeRequest(
  ev: NDKEvent,
  state: Nostrocket,
  consensusMode: ConsensusMode
): Error | null {
  if (consensusMode != ConsensusMode.FromConsensusEvent) {
    if (!get(nostrocketParticipants).includes(ev.pubkey)) {
      return new Error("pubkey is not in identity tree");
    }
  }
  switch (ev.kind) {
    case 1031:
    case 15171031:
      return Handle1031(ev, state, { ConsensusMode: consensusMode });
    case 1602:
      return Handle1602(ev, state, { ConsensusMode: consensusMode });
    case 1603:
      return Handle1603(ev, state, { ConsensusMode: consensusMode });
  }
  return new Error("don't know how to handle that event kind");
}
