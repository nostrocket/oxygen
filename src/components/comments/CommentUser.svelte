<script lang="ts">
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { InlineLoading } from "carbon-components-svelte";
  import { Launch } from "carbon-icons-svelte";
  import pl from "date-fns/locale/pl";
  import { derived, writable } from "svelte/store";

  export let pubkey: string;
  export let large: boolean = false;
  export let profile:NDKUser|undefined = undefined;

  let styletag = "color: #fb923c";

  let pk = writable(pubkey)

  $:{
    pk.update(p=>{
      return pubkey
    })
  }

  let user = derived([profiles, ndk_profiles, pk], ([$profiles, $ndk_profiles, $pk]) => {
    if ($profiles.has($pk)) {
      return $profiles.get($pk);
    }
    let u = $ndk_profiles.getUser({ hexpubkey: $pk });
    u.fetchProfile().then(() => {
      profiles.update((s) => {
        s.set(u.pubkey, u);
        return s;
      });
    });
  });

  let name = derived([user], ([$user]) => {
    if ($user?.profile?.name) {
      return $user.profile.name;
    }
    if ($user?.profile?.displayName) {
      return $user.profile.displayName;
    }
    return undefined;
  });

  $: {
    if (large) {
      styletag = "color: #fb923c; margin: 0 5px";
    }
  }
</script>

{#if $name}
  <span style="color: #fb923c"> {$name}</span><a
    href={"https://primal.net/p/" + $user?.npub}
    target="_blank"
    rel="noopener noreferrer"><Launch /></a
  >
{:else}
  <InlineLoading description="Fetching NIP05 Data" />
{/if}
