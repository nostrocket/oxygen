<script>
  import { fetchProblemEvents, problemEvents } from "$lib/stores/problems";
  import { Problems, Rockets, consensusTipState } from "$lib/stores/state";
  import { Row, Tile } from "carbon-components-svelte";
  import AddProblem from "../../components/modals/AddProblem.svelte"; 
  
  fetchProblemEvents()

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
</Tile>
</Row>
{/each}

{#each [$problemEvents.get("305f2ca2fda5d988e41f17aae4deefb32b9cdb5dec42cd6fe2e518ee46592567")] as event}
    <p>{event?.id}</p>
{/each}