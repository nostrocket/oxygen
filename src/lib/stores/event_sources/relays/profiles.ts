import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import { writable } from "svelte/store";
import { profileRelays } from "../../../../settings";

const _profiles: NDKSvelte = new NDKSvelte({
  explicitRelayUrls: profileRelays,
});

export const ndk_profiles = writable(_profiles);