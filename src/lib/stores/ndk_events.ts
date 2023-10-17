import { browser } from "$app/environment";
import { defaultRelays, profileRelays } from "$lib/settings";
import type { NDKCacheAdapter } from "@nostr-dev-kit/ndk";
import NDKDexieCacheAdapter from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { writable } from "svelte/store";

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
  cacheAdapter = new NDKDexieCacheAdapter({
    dbName: "nostrocket",
  });
}

const _ndk: NDKSvelte = new NDKSvelte({
  explicitRelayUrls: defaultRelays,
});

const ndk = writable(_ndk);

export default ndk;

const _profiles: NDKSvelte = new NDKSvelte({
  explicitRelayUrls: profileRelays,
});

export const ndk_profiles = writable(_profiles);

console.log({ cacheAdapter: !!cacheAdapter });
