<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { ListItem, UnorderedList } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import { derived } from "svelte/store";
  import StatusTag from "../tags/StatusTag.svelte";
  import { removeSpiuriousChildren } from "../novoproblems/elements/helpers";

  export let problem: Problem;

  function getRocket(pr: Problem) {
    return $consensusTipState.RocketMap.get(pr.Rocket);
  }

  let selected = derived(page, ($page) => {
    return $page.params.id == problem.UID
  });

  let element: HTMLDivElement;

  selected.subscribe(s=>{
    if (s && element) {
      element.scrollIntoView()
    }
  }) 

  onMount(()=>{if ($selected && element) {
    removeSpiuriousChildren($consensusTipState)
    }})
</script>

{#if getRocket(problem)}
  {#if problem.Status != "closed"}
    <ListItem
      
      style="cursor:pointer;{$selected?"background:teal;":""}"
      on:click={() => {
        goto(
          `${base}/${getRocket(problem)?.Name}/problems/${
            problem.UID
          }?tab=problem`
        );
      }}><div id={problem.UID} bind:this={element}></div>{problem.Title} <StatusTag type="standard" {problem} /></ListItem
    >
    {#each problem.FullChildren as child}
      <UnorderedList nested><svelte:self problem={child} /></UnorderedList>
    {/each}
  {/if}
{/if}
