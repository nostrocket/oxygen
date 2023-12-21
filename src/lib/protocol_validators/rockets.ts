import type { Nostrocket } from "$lib/stores/nostrocket_state/types";
import { ignitionPubkey } from "../../settings";

export function pubkeyHasVotepower(pubkey:string, state:Nostrocket):boolean {
        //validate signer has votepower
        if (pubkey == ignitionPubkey) {
          //todo: get pubkey's votepower from current state instead of hardcoding the ignition account
          return true;
        }
        return false
}
