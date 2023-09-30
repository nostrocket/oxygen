import { ignitionPubkey } from "$lib/settings";
import { identityMap } from "$lib/stores/state";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

export function validate(e: NDKEvent): boolean {
    switch (e.kind) {
        case 15171031:
            return validate15171031(e)
        case 15172008:
            return validate15172008(e)
    }
    return false
}

function validate15171031(e: NDKEvent): boolean {
    if (e.kind == 15171031) {
        //check that signer is in identity tree
        if (get(identityMap).get(e.pubkey)) {
            //todo get snapshot of current state and attempt to apply this state change
            return true
        }
        
    }
return false
}

function validate15172008(e: NDKEvent): boolean {
    if (e.kind == 15172008) {
        //check that signer is in identity tree
        if (get(identityMap).get(e.pubkey)) {
            //validate signer has votepower
            if (e.pubkey == ignitionPubkey) {
                //todo get pubkey's votepower from current state instead of hardcoding the ignition account
                return true
            }
            return false
        }
        
    }
return false
}