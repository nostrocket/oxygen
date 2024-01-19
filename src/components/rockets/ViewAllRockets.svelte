<script>
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Rocket } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import RocketItem from "./RocketItem.svelte";
  import { Button } from "carbon-components-svelte";
  import { goto } from "$app/navigation";

  let sortedRockets = derived(consensusTipState, ($current) => {
    let rockets = [...$current.RocketMap];
    //todo: put problem size calc in here instead
    rockets.sort(([s0, a], [s1, b]) => {
      return b.Problems.size - a.Problems.size;
    });
    return rockets;
  });
</script>
<Button icon={Rocket} on:click={()=>{goto(`${base}/rockets/ignition`)}}>LAUNCH A NEW ROCKET NOW</Button>
{#each [...$sortedRockets] as [key, rocket]}
  <RocketItem {rocket} />
{/each}
