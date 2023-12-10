<script lang="ts">
  import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { InlineLoading } from "carbon-components-svelte";
  import { Launch } from "carbon-icons-svelte";
  import { writable } from "svelte/store";

  export let pubkey: string;
  export let large: boolean = false;

  let styletag = "color: #fb923c";

  let user = writable<NDKUser | undefined>(undefined);

  let loading = true

  $: {
    loading =  !($user?.profile?.name || $user?.profile?.displayName)
  }
  $: {
    $user = getUser(pubkey);
  }

  function getUser(p: string): NDKUser | undefined {
    let u: NDKUser | undefined = undefined;
    if (p) {
      if ($profiles.has(p)) {
        let existing = $profiles.get(p);
        if (existing) {
          u = existing;
        }
      }
      if (!u) {
        (async () => {
          u = $ndk_profiles.getUser({ hexpubkey: p });
          u.fetchProfile().then(() => {
            profiles.update((s) => {
              if (u) {
                s.set(u.pubkey, u);
              }
              return s;
            });
          });
        })();
      }
    }
    return u;
  }

  $: {
    if (large) {
      styletag = "color: #fb923c; margin: 0 5px";
    }
  }
</script>
{#if !loading}
  <span style="color: #fb923c">
    {#if $user?.profile?.name}{$user?.profile
        ?.name}{:else if $user?.profile?.displayName}{$user?.profile
        ?.displayName}{/if}</span
  ><a
    href={"https://primal.net/p/" + $user?.npub}
    target="_blank"
    rel="noopener noreferrer"><Launch /></a
  >  
  {:else}
  <InlineLoading description="Fetching NIP05 Data" />
{/if}
