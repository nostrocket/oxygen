import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Nostrocket, Rocket } from "../types";

export function HandleIdentityEvent(e: NDKEvent, state: Nostrocket) {
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
    let existing = r.IdentityEvents.get(e.pubkey)
    if (existing) {
      for (let ev of existing) {
        if (ev.getMatchingTags("d")[0][1] == e.getMatchingTags("d")[0][1]) {
          if (ev.created_at! > e.created_at!) {
            let err = new Error();
            err.message = "already have a newer identity event from this pubkey";
            err.cause = e.id;
            throw err;
          }
        }
      }
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
      somethingWorked = true;
    }
    if (maintainers) {
      r.Maintainers.set(e.pubkey, newMaintainersForThisPubkey);
      somethingWorked = true;
    }
    if (somethingWorked) {
      let existing = r.IdentityEvents.get(e.pubkey)
      if (!existing) { existing = new Set()}
      let exists = false;
      for (let ev of existing) {
        if (ev.id == e.id) {exists = true}
      }
      if (!exists) {
        existing.add(e)
        r.IdentityEvents.set(e.pubkey, existing)
      }
      state.RocketMap.set(r.UID, r);
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
