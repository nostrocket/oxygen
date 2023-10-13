<script>
    import { fetchProblemEvents, problemEvents } from "$lib/stores/problems";
    import { Problems, Rockets } from "$lib/stores/state";
    import { Row, Tile } from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
  import Problem from "../../components/objects/Problem.svelte";
   
    
    fetchProblemEvents(undefined)

  </script>
  <h2>Problem Tracker</h2>
  <AddProblem />


  
  {#each $Problems as problem}
  {#if !problem.Parents}<Problem {problem} depth={0}/>{/if}
  {/each}