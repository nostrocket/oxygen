<script lang="ts">
    import { consensusTipState } from "$lib/stores/state";
    import type { Problem } from "$lib/types";
    import { Accordion, AccordionItem } from "carbon-components-svelte";
  import AddProblem from "../modals/AddProblem.svelte";

export let problem:Problem;
export let depth:number;

</script>


  <Accordion>
    <AccordionItem style="margin-left:{depth}%">
      <svelte:fragment slot="title">
        <h5>{problem.Title}</h5>
        {#if problem.Summary}<div>{problem.Summary}</div>{/if}
      </svelte:fragment>
      {#if problem.FullText}<p>{problem.FullText}</p>{/if}
      <AddProblem parent={problem.UID}/>
    </AccordionItem>
</Accordion>
{#if problem.Children}
{#each problem.Children.entries() as [childProblem]}
{#if $consensusTipState.Problems.get(childProblem)}
<svelte:self problem={$consensusTipState.Problems.get(childProblem)} depth={depth+1}/>
{/if}
{/each}
{/if}