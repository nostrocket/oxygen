<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Accordion, Column, Row, Tile } from "carbon-components-svelte";
  import ProblemComponent from "./ProblemComponent.svelte";
  import { onMount } from "svelte";
  export let problem: Problem;

  function getList(head: Problem, populate: Problem[]): number {
    populate.push(head);
    if (head.Parents.size > 0) {
      let pID = head.Parents.values().next().value;
      let parent = $consensusTipState.Problems.get(pID);
      if (parent) {
        console.log(parent.UID)
        return getList(parent, populate);
      }
    }
    return populate.length;
  }

  let listOfParents: Problem[] = [];

  onMount(()=>{
    getList(problem, listOfParents);
    listOfParents.reverse();
    listOfParents = listOfParents.filter((p) => {
      return p.UID != problem.UID;
    });
    let i = 0
    for (let p of listOfParents) {
        p.Depth = i
        i++
    }
  })
</script>

{#if problem.Parents.size > 0}
  <Row padding>
    <Column>
      <Tile light>
        <Accordion size="sm">
            {#each listOfParents as parent}
            <ProblemComponent depth={parent.Depth} problem={parent} dontShowExtraChildren/>
            {/each}
        </Accordion>
      </Tile>
    </Column>
  </Row>
{/if}
