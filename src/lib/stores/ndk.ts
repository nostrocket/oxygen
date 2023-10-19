import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import {defaultRelays, profileRelays} from "$lib/settings";
import {writable} from "svelte/store";
import type {NDKEvent} from "@nostr-dev-kit/ndk";

const _ndk = new NDKSvelte({explicitRelayUrls: [...defaultRelays, ...profileRelays]});

(async () => {
    try {
        await _ndk.connect();
        console.log('NDK connected here...');
    } catch (e) {
        console.error(e);
    }
})();



export default writable<NDKSvelte>(_ndk)


