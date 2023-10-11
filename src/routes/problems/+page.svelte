<script>
  import { GetTextEventID, GetTitleFromTextEvent, fetchProblemEvents, problemEvents } from "$lib/stores/problems";
  import { Problems, Rockets } from "$lib/stores/state";
  import { Row, Tile } from "carbon-components-svelte";
  import AddProblem from "../../components/modals/AddProblem.svelte";
 
  
  fetchProblemEvents(undefined)

</script>
<h2>Problem Tracker</h2>
<AddProblem />

<!-- {#each [...$Problems] as [id, problem]}
    <p>{problem.UID}</p>
{/each} -->

{#each $Problems as problem}
<Row>
<Tile>
  <p>{problem.UID}</p>  
  <p>Last Update: {problem.LastHeadHeight}</p>
  <p>Status: {problem.Status}</p>
  <p>Rocket: {$Rockets.get(problem.Rocket)?.Name.toUpperCase()}</p>
  <p>
    {GetTitleFromTextEvent($problemEvents.get(GetTextEventID($problemEvents.get(problem.LastCommit))))}
  </p>
</Tile>
</Row>
{/each}