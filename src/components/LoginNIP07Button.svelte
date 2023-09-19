<script lang="ts">
  import { login } from "$lib/helpers/login";
  import { currentUser } from "$lib/stores/current-user";
  import ndk from "$lib/stores/ndk";
  import { Button } from "carbon-components-svelte";

let noNip07extenion = false; //svelte wants typescript (and so do I) but vite is being a dick and does not allow types to be used so I have to initate everything with a value.

$: noNip07extenion = !window.nostr


async function loginNip07() {
        const user = await login($ndk, undefined, 'nip07');

        if (!user) {
            alert('Login failed');
        } else {
            $currentUser = user;
            localStorage.setItem('nostr-key-method', 'nip07');
            localStorage.setItem('nostr-target-npub', $currentUser.npub);
            $currentUser.fetchProfile()
        }
    }
</script>
<Button on:click={loginNip07}>NIP07 Login</Button>
<div>
</div>