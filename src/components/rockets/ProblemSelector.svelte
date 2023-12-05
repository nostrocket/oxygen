<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";
  import { Rocket as RocketIcon } from "carbon-icons-svelte";
  import { InlineLoading, InlineNotification, Row, Select, SelectItem, SelectItemGroup, Tile } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import Problems from "../views/Problems.svelte";
  export let state: Nostrocket | undefined;
  let thisUsersProblems: Problem[] = [];

  let selected:Problem|undefined
  export let Selected:Problem|undefined
  export let dropdown:boolean = false

  let dropdownSelected:string|undefined = undefined;

  $: {
    if (Selected && !selected) {
      selected = Selected
      dropdownSelected = selected.UID
    }
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

  function setSelected(id:string) {
    for (let problem of thisUsersProblems) {
      if (problem.UID == id) {
        console.log(37)
        Selected = problem
      } 
    }
  }
</script>
{#if thisUsersProblems.length == 0}
<InlineLoading description="SEARCHING FOR PROBLEMS THAT YOU HAVE LOGGED..." />
{/if}
{#if dropdown && thisUsersProblems.length > 0}
<Select bind:selected={dropdownSelected} on:change={(e)=>{setSelected(e.target.value)}}>
  <SelectItemGroup>
    {#each thisUsersProblems as problem}
    <SelectItem value={problem.UID} text={problem.Title} />
    {/each}
  </SelectItemGroup>
</Select>
{:else}
{#each thisUsersProblems as problem}
<Row>
    <Tile style="width:100%;" light={!(problem.UID == selected?.UID)} on:click={()=>{selected = problem}}>
      {#if problem.UID != selected?.UID}<span style="cursor:pointer;">{problem.Title}</span>{/if}
    {#if problem.UID == selected?.UID}<RocketIcon /><span style="background-color:darkgreen;">{problem.Title}</span>{/if}
    {#if problem.UID == selected?.UID}<div style="padding: 1%;"><a href="#" on:click={()=>{Selected = selected}}>Select this problem</a></div>{/if}
  </Tile>
  </Row>
{/each}
{/if}


