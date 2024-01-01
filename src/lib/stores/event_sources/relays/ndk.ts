import { browser } from "$app/environment";
import { NDKNip07Signer, type NDKCacheAdapter, type NDKEvent } from "@nostr-dev-kit/ndk";
import NDKDexieCacheAdapter from "@nostr-dev-kit/ndk-cache-dexie";
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { derived, get, writable } from "svelte/store";
import { defaultRelays, profileRelays, rootEventID } from "../../../../settings";
import { allNostrocketEventKinds } from "../kinds";
import { login } from "$lib/helpers/login";
import { currentUser } from "$lib/stores/hot_resources/current-user";

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

const _profiles: NDKSvelte = new NDKSvelte({
  explicitRelayUrls: profileRelays,
});

export const ndk_profiles = writable(_profiles);

(async () => {
  try {
    await _profiles.connect();
    console.log("NDK Profiles connected");
  } catch (e) {
    console.error(e);
  }
})();


export async function loginNip07(alertUser?:boolean) {
  const user = await login($ndk, undefined, "nip07");
  if (!user && alertUser) {
    alert("Login failed");
  } else {
    currentUser.update(cu=>{
      cu = user || undefined;
      return cu
    })
    localStorage.setItem("nostr-key-method", "nip07");
    let cu = get(currentUser)
    if (cu) {
      localStorage.setItem("nostr-target-npub", cu.npub);
    cu.fetchProfile();
    let signer = new NDKNip07Signer();
    _ndk.signer = signer
    _profiles.signer = signer;
    }
  }
}