import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Account, Nostrocket } from "../types";

export function HandleIdentityEvent(e:NDKEvent, state:Nostrocket):boolean {
    for (let dTag of e.getMatchingTags("d")) {
        if (dTag[1].length == 64) {
          let r = state.RocketMap.get(dTag[1]);
          if (r?.UID == dTag[1]) {
            if (e.kind == 31009) {
                if (r.isParticipant(e.pubkey)) {
                  let list: Array<Account> = [];
                  for (let pk of e.getMatchingTags("p")) {
                    if (pk[1]) {
                      if (pk[1].length == 64 && !r.isParticipant(pk[1])) {
                        list.push(pk[1]);
                      }
                    }
                  }
                  if (list.length > 0) {
                    r.Participants.set(e.pubkey, list);
                    state.RocketMap.set(r.UID, r);
                    return true;
                  }
                }
              }
          }
        }
      }
      return false
}

