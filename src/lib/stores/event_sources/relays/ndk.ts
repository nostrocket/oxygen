import { browser } from "$app/environment";
import type { NDKCacheAdapter, NDKEvent } from "@nostr-dev-kit/ndk";
import NDKDexieCacheAdapter from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { derived, get, writable } from "svelte/store";
import { defaultRelays, rootEventID } from "../../../../settings";
import { allNostrocketEventKinds } from "../kinds";

let cacheAdapter: NDKCacheAdapter | undefined;

if (browser) {
  //todo: make this work maybe
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

//export default ndk;

const _rootEvents = $ndk.storeSubscribe<NDKEvent>(
  { "#e": [rootEventID] }, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
  { closeOnEose: false }
);


//events randomly go missing if we do not have multiple subscriptions
const _nostrocketKinds = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds }, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
  { closeOnEose: false }
);


export const allNostrocketEvents = derived([_rootEvents, _nostrocketKinds], ([$root, $kinds]) => {
  $root.filter((e) => {
    if (e.kind) {
      return allNostrocketEventKinds.includes(e.kind);
    }
    return false;
  });
  $kinds.filter((e) => {
    if (e.kind) {
      return allNostrocketEventKinds.includes(e.kind);
    }
    return false;
  });
  return [...new Set([...$root, ...$kinds])]
});

_nostrocketKinds.onEose(()=>{
  eose.set(true);
});




(async () => {
  try {
      await _ndk.connect();
      console.log('NDK connected');
  } catch (e) {
      console.error(e);
  }
})();