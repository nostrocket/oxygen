<script lang="ts">
  import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import { InlineLoading } from "carbon-components-svelte";
  import { Launch } from "carbon-icons-svelte";
  import { derived } from "svelte/store";

  export let pubkey: string;
  export let large: boolean = false;

  let styletag = "color: #fb923c";

  let user = derived(
    [profiles, ndk_profiles],
    ([$profiles, $ndk_profiles]) => {
      if ($profiles.has(pubkey)) {
        return $profiles.get(pubkey);
      }
      let u = $ndk_profiles.getUser({ hexpubkey: pubkey });
      u.fetchProfile().then(() => {
        profiles.update((s) => {
            s.set(u.pubkey, u);
          return s;
        });
      });
    }
  );

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
