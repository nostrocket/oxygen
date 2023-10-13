<script>
    import { fetchProblemEvents, problemEvents } from "$lib/stores/problems";
    import { Problems, Rockets } from "$lib/stores/state";
    import { Row, Tile } from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
   
    
    fetchProblemEvents(undefined)

  </script>
  <h2>Problem Tracker</h2>
  <AddProblem />
  
  {#each $Problems as problem}
  <Row>
  <Tile>
      <h3>{problem.Title}</h3>
      {#if problem.Summary}<h6>{problem.Summary}</h6>{/if}
      {#if problem.FullText}<p>{problem.FullText}</p>{/if}
    <p>ID: {problem.UID}</p>  
    <p>Last Update: {problem.LastHeadHeight}</p>
    <p>Status: {problem.Status}</p>
    <p>Rocket: {$Rockets.get(problem.Rocket)?.Name.toUpperCase()}</p>
    <AddProblem parent={problem.UID} />
  </Tile>
  </Row>
  {/each}