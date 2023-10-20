<script lang="ts">
  import { processMempool } from "$lib/consensus/consensus_event_producer";
  import { login } from "$lib/helpers/login";
  import { ndk } from "$lib/stores/event_sources/relays/ndk";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
  import { Button } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";

  let noNip07extenion = false; //svelte wants typescript (and so do I) but vite is being a dick and does not allow types to be used so I have to initate everything with a value.

  $: noNip07extenion = !window.nostr;

  export async function loginNip07() {
    const user = await login($ndk, undefined, "nip07");

    if (!user) {
      alert("Login failed");
    } else {
      $currentUser = user;
      localStorage.setItem("nostr-key-method", "nip07");
      localStorage.setItem("nostr-target-npub", $currentUser.npub);
      $currentUser.fetchProfile();
      let signer = new NDKNip07Signer();
      $ndk.signer = signer;
      processMempool();
    }
  }
</script>

<Button size="small" on:click={loginNip07} icon={User}>NIP07 Login</Button>
<div />
