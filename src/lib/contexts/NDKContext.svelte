<script lang="ts">
    import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
    import {defaultRelays} from "$lib/settings";
    import {writable} from "svelte/store";
    import {onMount, setContext} from "svelte";

    const _ndk: NDKSvelte = new NDKSvelte({explicitRelayUrls: defaultRelays});
    const ndk = writable<NDKSvelte>(_ndk);
    setContext('ndk', ndk)

    onMount(async () => {
        try {
            await $ndk.connect()
            console.log('NDK connected...')
        } catch (err) {
            console.error(err)
        }
    })
</script>

<main>
    <slot/>
</main>