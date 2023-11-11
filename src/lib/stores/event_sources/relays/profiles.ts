import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { writable } from "svelte/store";
import { profileRelays } from "../../../../settings";

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
