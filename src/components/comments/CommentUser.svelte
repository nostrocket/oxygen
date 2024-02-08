<script lang="ts">
  import { goto } from "$app/navigation";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { InlineLoading } from "carbon-components-svelte";
  import { Launch } from "carbon-icons-svelte";
  import { derived, writable } from "svelte/store";

  export let pubkey: string;
  export let large: boolean = false;
  export let profile:NDKUser|undefined = undefined;
  export let profileName:string|undefined = undefined;
  export let textOnly = false;

  let styletag = "color: #fb923c";

  let pk = writable(pubkey)

  $:{
    pk.update(p=>{
      return pubkey
    })
  }

  let user = derived([profiles, ndk_profiles, pk], ([$profiles, $ndk_profiles, $pk]) => {
    if ($pk) {
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
    }
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

  $:{
    profileName = $name
  }

  $: {
    if (large) {
      styletag = "color: #fb923c; margin: 0 5px";
    }
  }
</script>

{#if !textOnly}
{#if $name}
  <span style="color: #fb923c; cursor:pointer;display:inline;" on:click={()=>{goto("https://primal.net/p/" + $user?.npub)}}>{$name}</span>
{:else}
  <InlineLoading description="Fetching NIP05 Data" />
{/if}
{/if}
{#if textOnly}
{#if $name}{$name}{:else}[fetching NIP05 event...]{/if}
{/if}
