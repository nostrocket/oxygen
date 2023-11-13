<script lang="ts">
    import type {NDKUser, NDKUserProfile} from "@nostr-dev-kit/ndk";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";

    export let pubkey: string;

    let commentUser: NDKUser;
    let userProfile: NDKUserProfile | undefined

    $: if (userProfile === undefined) {
        (async () => {
            commentUser = $ndk.getUser({ hexpubkey: pubkey });
            await commentUser.fetchProfile();
            userProfile = commentUser?.profile
        })()
    }
</script>


<span style="color: #fb923c">{userProfile?.name}</span>

