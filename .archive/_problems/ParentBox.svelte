<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Accordion, Column, Row } from "carbon-components-svelte";
  import { ArrowDown } from "carbon-icons-svelte";
  import ProblemComponent from "./ProblemComponent.svelte";
  export let problem: Problem;

  function getList(head: Problem, populate: Problem[]): number {
    populate.push(head);
    if (head.Parents.size > 0) {
      let pID = head.Parents.values().next().value;
      let parent = $consensusTipState.Problems.get(pID);
      if (parent) {
        return getList(parent, populate);
      }
    }
    return populate.length;
  }

  let listOfParents: Problem[] = [];

  function populate() {
    listOfParents = [];
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
  }

$: {
    if (problem) {
        populate()
    }
    
}
</script>

{#if problem.Parents.size > 0}
  <Row>
    <Column>
        <Accordion size="sm">
            {#each listOfParents as parent}
            <ProblemComponent problem={parent} dontShowExtraChildren/>
            {/each}
        </Accordion>
    </Column>
  </Row>
{/if}
