<script lang="ts">

  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { ListItem, UnorderedList } from "carbon-components-svelte";
  import StatusTag from "./StatusTag.svelte";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";

  export let problem:Problem;

 let background = derived(page, ($page) => {
    return ($page.params.id == problem.UID)?"background:magenta;":""
 })

</script>
{#if problem.Status != "closed"}
<ListItem style="cursor:pointer;{$background}" on:click={()=>{goto(`${base}/problems/${problem.UID}?tab=0`)}}>{problem.Title} <StatusTag {problem} /></ListItem>
{#each problem.FullChildren as child}
<UnorderedList nested><svelte:self problem={child}/></UnorderedList>
{/each}
{/if}