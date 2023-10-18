<script lang="ts">
    import {derived, writable} from "svelte/store";
    import {getContext, setContext} from "svelte";
    import {Nostrocket} from "$lib/types";
    import type NDKSvelte from "@nostr-dev-kit/ndk-svelte";
    import {NDKEvent} from "@nostr-dev-kit/ndk";
    import {rootEventID} from "$lib/settings";
    import {allNostrocketEventKinds} from "$lib/kinds";

    const ndk = getContext<NDKSvelte>('ndk')
    const _nostrocketTipState = new Nostrocket(JSON.stringify(''))
    const nostrocketTipState = writable<Nostrocket>(_nostrocketTipState)

    const allNostrocketEventKindSub = $ndk.storeSubscribe<NDKEvent>(
        {"#e": [rootEventID], kinds: allNostrocketEventKinds}, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
        {closeOnEose: false}
    )

    export const allEventKinds = $ndk.storeSubscribe<NDKEvent>(
        {kinds: allNostrocketEventKinds}, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
        {closeOnEose: false}
    );

    export const allNostrocketEvents = derived(allNostrocketEventKindSub, ($allNostrocketEventKindSub) => {
        $allNostrocketEventKindSub.filter((e) => {
            if (e.kind) {
                return allNostrocketEventKinds.includes(e.kind);
            }
            return false;
        });
        return $allNostrocketEventKindSub;
    });

    setContext('consensusTipState', nostrocketTipState)
</script>

<main>
    <slot/>
</main>