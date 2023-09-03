import { writable } from "svelte/store";

import NDKSvelte from "@nostr-dev-kit/ndk-svelte";

const ndk = new NDKSvelte({
  explicitRelayUrls: [
    "wss://nostr.688.org",
    // "wss://relay.damus.io",
    // "wss://nos.lol"
  ],
});
ndk
  .connect()
  .then(() => console.log("NDK Connected"))
  .catch((error) => console.error("NDK connection failed", error));

const ndkStore = writable(ndk);

export default ndkStore;
