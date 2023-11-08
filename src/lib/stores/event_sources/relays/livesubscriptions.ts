import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import NDKSvelte, { type ExtendedBaseType, type NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { get, writable, type Writable } from "svelte/store";
import { defaultRelays, rootEventID } from "../../../../settings";
import { unixTimeNow } from "$lib/helpers/mundane";


export function initLiveSubscriptions():[Writable<NDKFilter>, NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined] {
    let _filter:Writable<NDKFilter> = writable({})
    let ndk = get(writable(new NDKSvelte({
        explicitRelayUrls: defaultRelays,
    })))
    //ndk.connect()
    //let f:NDKFilter = {ids: [rootEventID]}
    let currentsub:NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined = undefined;// = ndk.storeSubscribe<NDKEvent>(f, {closeOnEose: true});
    let lastFilter:NDKFilter;
    let lastTime = 0;
    _filter.subscribe(fi=>{
        if (fi != lastFilter || unixTimeNow() > lastTime+60) {
            if (!currentsub) {
                currentsub = ndk.storeSubscribe<NDKEvent>(fi, {closeOnEose: false})
            }
            lastFilter = fi
            lastTime = unixTimeNow()
            resub(currentsub, fi)
        }
        //try {currentsub?.unsubscribe()} catch {}
        // ndk.connect().then(()=>{
        //     currentsub = ndk.storeSubscribe<NDKEvent>(f)
        //     console.log(19)
        //     currentsub.subscribe(e=>{
        //         console.log(21, e[0])
        //     })
        // })
    })
    //setTimeout(()=>{resub(currentsub, lastFilter)}, 2000)
    return [_filter, currentsub]
}

function resub(currentsub:NDKEventStore<ExtendedBaseType<NDKEvent>>, fi: NDKFilter) {
    currentsub.unsubscribe()
    currentsub.changeFilters([fi])
    currentsub.startSubscription()
}