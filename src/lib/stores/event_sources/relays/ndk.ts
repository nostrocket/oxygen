import { browser } from "$app/environment";
import type { NDKCacheAdapter, NDKEvent } from "@nostr-dev-kit/ndk";
import NDKDexieCacheAdapter from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { derived, get, writable } from "svelte/store";
import { defaultRelays, rootEventID } from "../../../../settings";
import { allNostrocketEventKinds } from "../kinds";

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
  //todo:: make this work maybe
  cacheAdapter = new NDKDexieCacheAdapter({
    dbName: "nostrocket",
  });
}

const _ndk: NDKSvelte = new NDKSvelte({
  explicitRelayUrls: defaultRelays,
});

export const eose = writable(false);
export const ndk = writable(_ndk);
const $ndk = get(ndk);

export const _rootEvents = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds },
  { closeOnEose: false }
);

// export const allNostrocketEvents = derived([_rootEvents], ([$root]) => {
//   return [...new Set([...$root])];
// });

(async () => {
  try {
    await _ndk.connect();
    console.log("NDK connected");
  } catch (e) {
    console.error(e);
  }
})();
