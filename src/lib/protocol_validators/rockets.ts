import type { Nostrocket } from "$lib/stores/nostrocket_state/types";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { ignitionPubkey, nostrocketIgnitionEvent } from "../../settings";

export function validate(
  e: NDKEvent,
  state?: Nostrocket,
  kind?: number
): boolean {
  if (kind) {
    if (e.kind != kind) {
      return false;
    }
  }
  switch (e.kind) {
    case 15171031:
      return validate15171031(e, state!);
    case 15172008:
      return validate15172008(e, state!);
    case 31009:
      return validate31009(e, state!);
  }
  return false;
}

function validate31009(e: NDKEvent, state: Nostrocket): boolean {
  if (e.kind == 31009) {
    if (validateIdentity(e.pubkey, state)) {
      return true;
    }
  }
  return false;
}

function validate15171031(e: NDKEvent, state: Nostrocket): boolean {
  return true
  if (e.kind == 15171031) {
    //check that signer is in identity tree
    if (validateIdentity(e.pubkey, state)) {
      return true;
    }
  }
  return false;
}

export function pubkeyHasVotepower(pubkey:string, state:Nostrocket):boolean {
        //validate signer has votepower
        if (pubkey == ignitionPubkey) {
          //todo get pubkey's votepower from current state instead of hardcoding the ignition account
          return true;
        }
        return false
}

function validate15172008(e: NDKEvent, state: Nostrocket): boolean {
  if (e.kind == 15172008) {
    //check that signer is in identity tree
    if (validateIdentity(e.pubkey, state)) {
      //validate signer has votepower
      if (e.pubkey == ignitionPubkey) {
        //todo get pubkey's votepower from current state instead of hardcoding the ignition account
        return true;
      }
      return false;
    }
  }
  return false;
}

export function validateIdentity(
  pubkey: string | undefined,
  state?: Nostrocket
): boolean {
  let success = false;
  // if (!state) {
  //   state = get(consensusTipState);
  // }
  // let rocket = state.RocketMap.get(nostrocketIgnitionEvent)
  // if (!rocket) {console.log(71)}
  return true
  if (pubkey) {
    if (
      pubkey == ignitionPubkey ||
      state!.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(pubkey!)
    ) {
      success = true;
    }
  }
  return success;
}
