import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Account, Nostrocket, Rocket } from "../types";

export function HandleIdentityEvent(e: NDKEvent, state: Nostrocket): boolean {
  //if (e.kind == 1592) {
    //console.log(e)
    let r:Rocket|undefined = undefined
    let maintainers = false
    for (let dTag of e.getMatchingTags("d")) {
      if (dTag[1].length == 64) {
        r = state.RocketMap.get(dTag[1]);
      }
      if (dTag[1].length == 65) {
        r = state.RocketMap.get(dTag[1].slice(0,-1));
        maintainers = true
      }
        if (r) {
            if (r.isParticipant(e.pubkey)) {
              let existingParticipantsForThisPubkey = r.Participants.get(e.pubkey)
              if (!existingParticipantsForThisPubkey) {existingParticipantsForThisPubkey = []}
              let existingMaintainersForThisPubkey = r.Maintainers.get(e.pubkey)
              if (!existingMaintainersForThisPubkey) {existingMaintainersForThisPubkey = []}
              let newMaintainersForThisPubkey = []
              let newParticipantsForThisPubkey = []

              for (let pk of e.getMatchingTags("p")) {
                if (pk[1]?.length == 64) {
                  if (!r.isParticipant(pk[1]) || existingParticipantsForThisPubkey.includes(pk[1])) {
                    newParticipantsForThisPubkey.push(pk[1]);
                  }
                  if (r.isMaintainer(e.pubkey)) {
                    if ((!r.isMaintainer(pk[1]) || existingMaintainersForThisPubkey.includes(pk[1])) && pk[pk.length-1] == "maintainer") {
                        newMaintainersForThisPubkey.push(pk[1])
                    }
                  }
                }
              }
              let somethingWorked = false
              if (!maintainers) {
                r.Participants.set(e.pubkey, newParticipantsForThisPubkey);
                state.RocketMap.set(r.UID, r);
                somethingWorked = true
              }
              if (maintainers) {
                r.Maintainers.set(e.pubkey, newMaintainersForThisPubkey);
                state.RocketMap.set(r.UID, r);
                somethingWorked = true
              }
              if (somethingWorked) {return true}
            }
        }
      
    }
  //}
  return false;
}

export function IsParticipant(pubkey:string, credential:string, state:Nostrocket, rocketID:string) {
    //todo
}