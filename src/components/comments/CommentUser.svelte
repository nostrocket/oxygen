<script lang="ts">
    import type {NDKUser, NDKUserProfile} from "@nostr-dev-kit/ndk";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
  import { InlineLoading } from "carbon-components-svelte";

    export let pubkey: string;
    export let large:boolean = false;

    let styletag = "color: #fb923c"

    let commentUser: NDKUser;
    let userProfile: NDKUserProfile | undefined
    let gotOne:boolean = false

    $: if (userProfile === undefined) {
        (async () => {
            commentUser = $ndk_profiles.getUser({ hexpubkey: pubkey });
            await commentUser.fetchProfile();
            userProfile = commentUser?.profile
        })()
    }

    $: {
        if (!userProfile?.name && !userProfile?.displayName) {
            gotOne = false
        }
        if (userProfile?.name || userProfile?.displayName) {
            gotOne = true
        }
        if (large) {
            styletag = "color: #fb923c; margin: 0 5px"
        }
    }
</script>


{#if !gotOne}<InlineLoading description="Fetching NIP05 Data"/>{:else}<span style="color: #fb923c">{userProfile?.name || userProfile?.displayName}</span>{/if}

