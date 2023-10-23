<script lang="ts">
  import { Accordion } from "carbon-components-svelte";
  import AddProblem from "../../components/modals/AddProblem.svelte";
  import ProblemComponent from "../../components/elements/Problem.svelte";

  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived, type Readable } from "svelte/store";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
//problem: cannot filter the problem tracker by content etc
//problem: problems without titles are still being rendered becasue the ProblemComponent is pulling them from consensusTipState and our filtering is currently done in this if statement.
//solutoin to both of these problems: create a new derived store here and pass it to the ProblemComponent so that we can filter based on user input. See https://github.com/pablof7z/vendata.io/ for examples
</script>

<h2>Problem Tracker</h2>
<AddProblem />

<Accordion>
  {#each $consensusTipState.Problems as [id, problem]}
    {#if (!problem.Parents && problem.Head && problem.Title)}<ProblemComponent {problem} depth={0} />{/if}
  {/each}
</Accordion>

