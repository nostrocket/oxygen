import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Account, Nostrocket, Rocket } from "../types";

const lastIdentityEventAttempt = new Map<string, number>();
export function HandleIdentityEvent(e: NDKEvent, state: Nostrocket) {
  if (lastIdentityEventAttempt.get(e.pubkey)) {
    if (e.created_at < lastIdentityEventAttempt.get(e.pubkey)) {
      let err = new Error();
      err.message = "already have a newer identity event";
      err.cause = e.id;
      throw err;
    }
  }
  let r: Rocket | undefined = undefined;
  let maintainers = false;
  for (let dTag of e.getMatchingTags("d")) {
    if (dTag[1].length == 64) {
      r = state.RocketMap.get(dTag[1]);
    } else if (dTag[1].length == 65) {
      r = state.RocketMap.get(dTag[1].slice(0, -1));
      maintainers = true;
    } else {
      let err = new Error();
      err.message = "failed to find a rocket tag";
      err.cause = e.id;
    }
    if (!r) {
      let err = new Error();
      err.message = "we don't have that rocket in our current state";
      err.cause = e.id;
      throw err;
    }
    if (!r.isParticipant(e.pubkey)) {
      let err = new Error();
      err.message = "that person is not in the identity tree";
      err.cause = e.id;
      throw err;
    }
    let existingParticipantsForThisPubkey = r.Participants.get(e.pubkey);
    if (!existingParticipantsForThisPubkey) {
      existingParticipantsForThisPubkey = [];
    }
    let existingMaintainersForThisPubkey = r.Maintainers.get(e.pubkey);
    if (!existingMaintainersForThisPubkey) {
      existingMaintainersForThisPubkey = [];
    }
    let newMaintainersForThisPubkey = [];
    let newParticipantsForThisPubkey = [];

    for (let pk of e.getMatchingTags("p")) {
      if (pk[1]?.length == 64) {
        if (
          !r.isParticipant(pk[1]) ||
          existingParticipantsForThisPubkey.includes(pk[1])
        ) {
          newParticipantsForThisPubkey.push(pk[1]);
        }
        if (r.isMaintainer(e.pubkey)) {
          if (
            (!r.isMaintainer(pk[1]) ||
              existingMaintainersForThisPubkey.includes(pk[1])) &&
            pk[pk.length - 1] == "maintainer"
          ) {
            newMaintainersForThisPubkey.push(pk[1]);
          }
        }
      }
    }
    let somethingWorked = false;
    if (!maintainers) {
      r.Participants.set(e.pubkey, newParticipantsForThisPubkey);
      state.RocketMap.set(r.UID, r);
      lastIdentityEventAttempt.set(e.pubkey, e.created_at as number);
      somethingWorked = true;
    }
    if (maintainers) {
      r.Maintainers.set(e.pubkey, newMaintainersForThisPubkey);
      state.RocketMap.set(r.UID, r);
      lastIdentityEventAttempt.set(e.pubkey, e.created_at as number);
      somethingWorked = true;
    }
    if (somethingWorked) {
      return true;
    }
  }
  throw new Error("failed to process identity event");
}

export function IsParticipant(
  pubkey: string,
  credential: string,
  state: Nostrocket,
  rocketID: string
) {
  //todo
}
