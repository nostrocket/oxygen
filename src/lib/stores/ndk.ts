import { writable } from 'svelte/store';
import NDK from '@nostr-dev-kit/ndk';
import type { NDKCacheAdapter } from '@nostr-dev-kit/ndk';
import NDKDexieCacheAdapter from "@nostr-dev-kit/ndk-cache-dexie";
import { browser } from '$app/environment';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
    cacheAdapter = new NDKDexieCacheAdapter({
        dbName: "nostrocket"
    });
}

// get relays from localstorage
let relays;

try {
    // relays = localStorage.getItem('relays');
} catch (e) { /* empty */ }

let relayList: string[] = [];

if (relays) {
    relayList = JSON.parse(relays);
}

export const defaultRelays = [
    'wss://nostr.688.org',
    // 'ws://localhost:8080',
];

if (!relayList || !Array.isArray(relayList) || relayList.length === 0) {
    relayList = defaultRelays;
}

const _ndk: NDKSvelte = new NDKSvelte({
    explicitRelayUrls: relayList,
});

const ndk = writable(_ndk);

export default ndk

console.log({cacheAdapter: !!cacheAdapter})