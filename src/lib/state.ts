import { derived, get as getStore, writable } from "svelte/store";
import ndk from './stores/ndk';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { allNostrocketEventKinds } from './kinds';
import State from "./types";
import { ignitionPubkey } from "./settings";

//export const CurrentState = writable<Nostrocket>(State)

const $ndk = getStore(ndk);


// export let nostrocketState: Readable<Nostrocket> | undefined;
// export let allNostrocketEvents: NDKEventStore<NDKEvent> | undefined = undefined;
// export let testEvents: Readable<NDKEvent[]>;// | undefined;

// export function initNostrocketState() {
//     console.log("initNostrocketState")
//     allNostrocketEvents = $ndk.storeSubscribe(
//         { kinds: allNostrocketEventKinds },
//         { closeOnEose: false }
//     )
//     testEvents = derived(allNostrocketEvents, $allNostrocketEvents => {
//         return $allNostrocketEvents
//     })
    
// }

let allNostrocketEvents = $ndk.storeSubscribe<NDKEvent>(
    {kinds: allNostrocketEventKinds},
     {closeOnEose: false},
)

export const identitiesInTree = derived(allNostrocketEvents, $nr => {
    let timestamp = 0 
    $nr = $nr.filter(event => {
        if (event.created_at) {
            if (event.created_at > timestamp && event.pubkey === ignitionPubkey) {
                timestamp = event.created_at
                return true
            }
        }
    })
    $nr = $nr.filter(event => {
        if (event.created_at) {
            return event.created_at === timestamp
        }
    })
    if ($nr[0]) {
        let stateFromEvent = new State($nr[0].content)
        console.log(stateFromEvent.IdentityList)
        return stateFromEvent.IdentityList
    }
    return []
})