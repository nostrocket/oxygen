<script>
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Accordion, AccordionItem, Column, Row, StructuredList, StructuredListBody, StructuredListCell, StructuredListHead, StructuredListRow, Tag } from "carbon-components-svelte";
  import CreateRocket from "../../components/modals/CreateRocket.svelte";
  import RocketItem from "../../components/rockets/RocketItem.svelte";
  import { derived } from "svelte/store";

  let sortedRockets = derived(consensusTipState, ($current) => {

        let rockets = [...$current.RocketMap];

        rockets.sort(([s0, a], [s1, b])=>{
          return b.Problems.size - a.Problems.size
        })
        return rockets
      }
    );
</script>

<Row>
  <Column sm={8}>
    <CreateRocket />
  </Column>
</Row>
<Row>
<StructuredList condensed>

  <StructuredListBody>
    {#each [...$sortedRockets] as [key, rocket]}
    <RocketItem {rocket} />
    {/each}
  </StructuredListBody>
</StructuredList>



</Row>
