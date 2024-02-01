<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";
  import { Tooltip } from "carbon-components-svelte";
  import { ChevronRight } from "carbon-icons-svelte";
  import { getFirstParent, getRocket } from "./helpers";

  export let problem: Problem | undefined = undefined;
  export let state: Nostrocket;
  export let top = false;
  let open = false;

  function truncate(title:string):string {
    if (!top) {
      return title.substring(0, 20) + "...";
    }
    return title
  }

</script>

{#if problem}
  <svelte:self {state} problem={getFirstParent(problem, state)} />
  <span
    on:click={() => {
      goto(`${base}/nr/${getRocket(problem, state).Name}/problems/${problem.UID}`);
    }}
    on:mouseenter={() => {
      open = true;
    }}
    on:mouseleave={() => {
      open = false;
    }}
    style="vertical-align:top;cursor:pointer;display:inline-block;"
    >{truncate(problem.Title)}{#if !top}<Tooltip hideIcon bind:open align="start"
        ><p>{problem.Title}</p></Tooltip
      >{/if}</span
  >
  <ChevronRight size={16} />
{/if}
