<script lang="ts">
  import { makeHtml } from "$lib/helpers/mundane";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
    export let problem:Problem|undefined = undefined
    export let size:string = ""
    
</script>

{#if problem}
<Tile>
    {#if size == "small"} 
    <h5>{problem.Title}</h5>
    <Tile light>{problem.Summary}</Tile>
    {:else} 
    <h2>{problem.Title}</h2>
    <Tile light>{problem.Summary}</Tile>
    {#if problem.FullText?.length > 0}{makeHtml(problem.FullText)}{/if}
    {/if}
</Tile>
{/if}