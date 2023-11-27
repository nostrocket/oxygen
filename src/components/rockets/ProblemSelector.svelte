<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";
  import { Rocket as RocketIcon } from "carbon-icons-svelte";
  import { Row, Tile } from "carbon-components-svelte";
  export let state: Nostrocket | undefined;
  let thisUsersProblems: Problem[] = [];

  let selected:Problem|undefined
  export let Selected:Problem|undefined
  
  $: {
    if (state && $currentUser) {
      thisUsersProblems = [];
      for (let [id, problem] of state.Problems) {
        if (
          problem.CreatedBy == $currentUser.pubkey &&
          problem.Status == "open"
        ) {
          thisUsersProblems.push(problem);
        }
      }
    }
  }
</script>

{#each thisUsersProblems as problem}
<Row>
    <Tile style="width:100%;" light={!(problem.UID == selected?.UID)} on:click={()=>{selected = problem}}>
    {#if problem.UID == selected?.UID}<RocketIcon /> {/if}<span style="cursor:pointer;">{problem.Title}</span>
    {#if problem.UID == selected?.UID}<div style="padding: 1%;"><a href="#" on:click={()=>{Selected = selected}}>I will die on this fucking hill, give me a rocket</a></div>{/if}
  </Tile>
  </Row>
{/each}
