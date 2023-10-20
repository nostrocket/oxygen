<script lang="ts">
    import {setContext} from "svelte";
    import {consensusTipState, eventsInState, mempool} from "$lib/consensus/state";

    setContext('consensusTipState', consensusTipState)
    setContext('mempool', mempool)
    setContext('eventsInState', eventsInState)
</script>

<main>
    <slot/>
</main>