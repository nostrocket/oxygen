<script>
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Column,
    Row,
    StructuredList,
    StructuredListBody,
  } from "carbon-components-svelte";
  import { Rocket } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
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

<a href={base + `/rockets/ignition`}>LAUNCH A NEW ROCKET NOW <Rocket /></a>
{#each [...$sortedRockets] as [key, rocket]}
  <RocketItem {rocket} />
{/each}
