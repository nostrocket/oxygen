<script>
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived } from "svelte/store";
  import NewRocketTile from "./NewRocketTile.svelte";
  import RocketItem from "./RocketItem.svelte";

  let sortedRockets = derived(consensusTipState, ($current) => {
    let rockets = [...$current.RocketMap];
    //todo: put problem size calc in here instead
    rockets.sort(([s0, a], [s1, b]) => {
      return b.Problems.size - a.Problems.size;
    });
    return rockets;
  });
</script>
<!-- <Button icon={Rocket} on:click={()=>{goto(`${base}/rockets/ignition`)}}>LAUNCH A NEW ROCKET NOW</Button> -->
<NewRocketTile />
{#each [...$sortedRockets] as [key, rocket]}
  <RocketItem {rocket} />
{/each}