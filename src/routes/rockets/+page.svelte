<script>
      import ndk from "$lib/stores/ndk";
    import { rockets } from "$lib/state";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { Rocket } from "carbon-pictograms-svelte";
</script>


<div>
    TEST ROCKET
    {#each $rockets as rocket}
        <h3><Rocket />{rocket.Name}</h3>
        <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} class="profile" />
        <p>Problem UID: {rocket.ProblemID}</p>
        <p>Rocket UID: {rocket.UID} </p>
    {/each}
</div>