<script lang="ts">
    import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
  import { profiles } from "$lib/stores/hot_resources/profiles";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { InlineLoading } from "carbon-components-svelte";
    import { Launch } from "carbon-icons-svelte";

    export let pubkey: string;
    export let large:boolean = false;

    let styletag = "color: #fb923c"

    let user: NDKUser;
    let usernameToDisplay:string|undefined = undefined;

    $: if (!user) {
        if ($profiles.has(pubkey)) {
            let existing = $profiles.get(pubkey)
            if (existing) {
                user = existing
            }
        }
        if (!user) {
            (async () => {
            user = $ndk_profiles.getUser({ hexpubkey: pubkey });
            user.fetchProfile().then(()=>{
                profiles.update(s=>{
                    s.set(user.pubkey, user)
                    return s
                })
//                usernameToDisplay = user.profile?.name
            });
        })()
        }
    }

    $: {
        if (!usernameToDisplay) {
            if (user?.profile?.name) {
            usernameToDisplay = user.profile.name
        } else if (user?.profile?.displayName) {
            usernameToDisplay = user.profile.displayName
        }
        if (large) {
            styletag = "color: #fb923c; margin: 0 5px"
        }
        }
    }
</script>


{#if !usernameToDisplay}<InlineLoading description="Fetching NIP05 Data"/>{:else}<span style="color: #fb923c">{usernameToDisplay}</span><a href={"https://primal.net/p/"+user.npub} target="_blank" rel="noopener noreferrer"><Launch /></a>{/if}