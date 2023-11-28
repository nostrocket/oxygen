<script>
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Row,
    StructuredList,
    StructuredListBody,
  } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import RocketItem from "../../components/rockets/RocketItem.svelte";
  import { base } from "$app/paths";
  import { AddAlt, Rocket } from "carbon-icons-svelte";

  let sortedRockets = derived(consensusTipState, ($current) => {
    let rockets = [...$current.RocketMap];

    rockets.sort(([s0, a], [s1, b]) => {
      return b.Problems.size - a.Problems.size;
    });
    return rockets;
  });
</script>

<Row>
  <StructuredList condensed>
    <StructuredListBody>
      <a href={base+`/rockets/ignition`}>LAUNCH A NEW ROCKET NOW <Rocket /></a>
      {#each [...$sortedRockets] as [key, rocket]}
        <RocketItem {rocket} />
      {/each}
    </StructuredListBody>
  </StructuredList>
</Row>
