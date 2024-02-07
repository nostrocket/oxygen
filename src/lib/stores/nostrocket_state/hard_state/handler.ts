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
    let participants = get(nostrocketParticipants)
    if (!participants) {
      throw new Error("could not fetch participants state")
    }
    if (!participants.includes(ev.pubkey)) {
      throw new Error("pubkey is not in identity tree");
    }
  }
  let err = null;
  switch (ev.kind) {
    case 1031:
    case 15171031:
      err = Handle1031(ev, state, { ConsensusMode: consensusMode });
      break;
    case 1602:
      err =  Handle1602(ev, state, { ConsensusMode: consensusMode });
      break;
    case 1603:
      err = Handle1603(ev, state, { ConsensusMode: consensusMode });
      break;
    default:
      throw new Error("cannot handle event kind " + ev.kind)
  }
  if (err != null) {throw err}
  return null
}
