<script lang="ts">
    import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
    import {profileRelays} from "$lib/settings";
    import {writable} from "svelte/store";
    import {onMount, setContext} from "svelte";

    const _ndkProfiles: NDKSvelte = new NDKSvelte({explicitRelayUrls: profileRelays});
    const ndkProfiles = writable<NDKSvelte>(_ndkProfiles);
    setContext('ndkProfiles', ndkProfiles)

    onMount(async () => {
        try {
            await $ndkProfiles.connect()
            console.log('NDK Profiles connected...')
        } catch (err) {
            console.error(err)
        }
    })
</script>

<main>
    <slot/>
</main>