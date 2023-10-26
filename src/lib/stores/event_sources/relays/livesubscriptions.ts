import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import NDKSvelte, { type ExtendedBaseType, type NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { get, writable, type Writable } from "svelte/store";
import { defaultRelays, rootEventID } from "../../../../settings";



export function initLiveSubscriptions():[Writable<NDKFilter>, NDKEventStore<ExtendedBaseType<NDKEvent>>] {
    let _filter:Writable<NDKFilter> = writable({})
    let ndk = get(writable(new NDKSvelte({
        explicitRelayUrls: defaultRelays,
    })))
    ndk.connect()
    let f:NDKFilter = {ids: [rootEventID]}
    let currentsub:NDKEventStore<ExtendedBaseType<NDKEvent>> = ndk.storeSubscribe<NDKEvent>(f, {closeOnEose: true});
    _filter.subscribe(fi=>{
        currentsub.unsubscribe()
        currentsub.changeFilters([fi])
        currentsub.startSubscription()
        //try {currentsub?.unsubscribe()} catch {}
        // ndk.connect().then(()=>{
        //     currentsub = ndk.storeSubscribe<NDKEvent>(f)
        //     console.log(19)
        //     currentsub.subscribe(e=>{
        //         console.log(21, e[0])
        //     })
        // })
    })
    return [_filter, currentsub]
}