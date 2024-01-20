<script lang="ts">

  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { ListItem, UnorderedList } from "carbon-components-svelte";
  import StatusTag from "../tags/StatusTag.svelte";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";

  export let problem:Problem;

  function getRocket(pr: Problem) {
    return $consensusTipState.RocketMap.get(pr.Rocket);
  }

 let background = derived(page, ($page) => {
    return ($page.params.id == problem.UID)?"background:teal;":""
 })

</script>
{#if getRocket(problem)}
{#if problem.Status != "closed"}
<ListItem style="cursor:pointer;{$background}" on:click={()=>{goto(`${base}/${getRocket(problem)?.Name}/problems/${problem.UID}?tab=problem`)}}>{problem.Title} <StatusTag type="standard" {problem} /></ListItem>
{#each problem.FullChildren as child}
<UnorderedList nested><svelte:self problem={child}/></UnorderedList>
{/each}
{/if}
{/if}