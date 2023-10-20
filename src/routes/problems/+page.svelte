<script>
  import { fetchProblemEvents } from "$lib/stores/nostrocket_state/soft_state/problems";
  import { Problems } from "$lib/consensus/state";
  import { Accordion } from "carbon-components-svelte";
  import AddProblem from "../../components/modals/AddProblem.svelte";
  import Problem from "../../components/elements/Problem.svelte";

  fetchProblemEvents(undefined);
</script>

<h2>Problem Tracker</h2>
<AddProblem />

<Accordion>
  {#each $Problems as problem}
    {#if !problem.Parents}<Problem {problem} depth={0} />{/if}
  {/each}
</Accordion>
