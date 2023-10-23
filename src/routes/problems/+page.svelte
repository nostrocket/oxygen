<script>
  import { Accordion } from "carbon-components-svelte";
  import AddProblem from "../../components/modals/AddProblem.svelte";
  import Problem from "../../components/elements/Problem.svelte";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
</script>

<h2>Problem Tracker</h2>
<AddProblem />

<Accordion>
  {#each $consensusTipState.Problems as [id, problem]}
    {#if !problem.Parents && problem.Head}<Problem {problem} depth={0} />{/if}
  {/each}
</Accordion>
