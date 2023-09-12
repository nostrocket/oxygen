<script>
  import { currentState } from "$lib/state";
  $: {console.log($currentState)}
</script>


<div>
    TEST ROCKET
    {#each $currentState?.IdentityList as identity}
        <p>{identity.Name}</p>
    {/each}
</div>