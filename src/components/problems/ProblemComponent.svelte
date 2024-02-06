<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { getDepthColor } from "$lib/helpers/ProblemDepthColor";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    AccordionItem,
    Button,
    InlineLoading,
    Tag,
  } from "carbon-components-svelte";
  import { View } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import ProblemButton from "./ProblemButton.svelte";
  import RecursiveDepth from "./RecursiveDepth.svelte";
  import { onMount } from "svelte";

  export let problem: Problem |undefined = undefined;
  export let problemID:string|undefined = undefined;
  export let problemStore = derived(consensusTipState, ($consensusTipState) => {
    return $consensusTipState.Problems;
  });

  let currentProblem = derived(problemStore, ($problemStore) => {
    if (problem) {
      return problem
    }
    if (problemID) {
      return $problemStore.get(problemID)
    }
  })
onMount(()=>{
  //console.log(problem?.Title)
})
  export let dontShowExtraChildren = false;
  export let onlyShowThisProblem = false;

  $: hideThisProblem = (dontShowExtraChildren && $currentProblem?.Status != "open" && !onlyShowThisProblem)

  let depthColor:string = ""

  let openState: boolean;

  $: focusProblem = (openState && !dontShowExtraChildren) ? "problem focus-problem" : "problem";
  let rocketName = "";
  let rocketColour = "purple";

  let problemStatusColor = "green";
  let problemStatusDescription = "";
  $: {
    if ($currentProblem) {
      depthColor = getDepthColor($currentProblem.Depth)
      if ($consensusTipState.RocketMap.get($currentProblem.Rocket)?.Name) {
        rocketName = $consensusTipState.RocketMap.get($currentProblem.Rocket)?.Name;
      }
      if (rocketName != "Nostrocket") {
        rocketColour = "teal";
      }
      problemStatusDescription = $currentProblem.Status;
      switch ($currentProblem.Status) {
        case "open":
          problemStatusColor = "green";
          break;
        case "claimed":
          problemStatusColor = "gray";
          break;
        case "patched":
          problemStatusColor = "cyan";
          break;
        case "closed":
          problemStatusColor = "red";
          break;
      }
      if ($currentProblem.Status == "open" && $currentProblem.FullChildren.size > 0) {
        problemStatusColor = "purple";
        problemStatusDescription = "open children";
      }
    }
  }

  $:{
    if(openState && dontShowExtraChildren) {
      openState = false
    }
  }
</script>
<RecursiveDepth />
{#if !$currentProblem}<InlineLoading />{problemID}{/if}
{#if $currentProblem  && !hideThisProblem}
  <AccordionItem
  on:click={()=>{if(dontShowExtraChildren){
    goto(`${base}/problems/${$currentProblem.UID}`)
  }}}
    class={focusProblem}
    style="margin-left:{onlyShowThisProblem?0:$currentProblem.Depth}%;--depthColor:{depthColor}; padding: 0"
    bind:open={openState}
  >
    <svelte:fragment slot="title">
      <h2 class="problem-title">
        {#if rocketName != "Nostrocket"}<Tag type={rocketColour}
            >{rocketName}</Tag
          >{/if}
        {#if $currentProblem.Title}{$currentProblem.Title}{:else}
          <InlineLoading />
        {/if}
        <Tag type={problemStatusColor}>{problemStatusDescription}</Tag>
      </h2>

      {#if $currentProblem.Summary}
        <div class="problem-summary">
          {$currentProblem.Summary}
        </div>
      {/if}
    </svelte:fragment>

    {#if $currentProblem.Status == "open"}<ProblemButton parent={problem} />{/if}
    <Button
      on:click={() => goto(`${base}/problems/${$currentProblem.UID}`)}
      size="small"
      kind="tertiary"
      iconDescription="View problem"
      icon={View}>More</Button
    >
  </AccordionItem>
  {#if $currentProblem.FullChildren && !dontShowExtraChildren}
    {#each $currentProblem.FullChildren as childProblem}

        <svelte:self
          {problemStore}
          problem={childProblem}
        />

    {/each}
  {/if}
{/if}

<style>
  /* problem styles */
  .problem-title {
    font-size: 16px;
    font-weight: 300;
    margin: 0;
  }

  .problem-summary {
    opacity: 0.5;
    font-size: 14px;
    font-weight: 200;
    margin: 0;
  }

  .problem-description {
    opacity: 0.9;
    margin-bottom: 1rem;
  }

  /* give a solid background so we don't see other elements behind this one when zooming in on it. */
  :global(.bx--accordion__heading, .bx--accordion__content) {
    background-color: #161616;
  }

  :global(.problem .bx--accordion__content) {
    padding: 2rem 1rem;
  }

  :glolbal(.problem, .problem div) {
    background-color: #161616;
  }

  :global(.problem .problem *) {
    transition: all 250ms ease-in-out;
    transform-style: preserve-3d;
    perspective: 1000px;
    will-change: transform;
  }

  :global(.problem > button) {
    border-left: var(--depthColor) 4px solid;
    border-bottom: transparent 0px solid;
  }

  /* when a problem is clicked, it becomes focused */
  :global(.focus-problem) {
    box-shadow: 0 0 50px #000, 0 0 50px #000; /*, 0 0 50px #000, 0 0 50px #000;*/
    transition: all 250ms ease-in-out;
    margin: 2rem 0;
  }

  :global(.focus-problem > button) {
    border-left: transparent 0px solid;
    border-bottom: var(--depthColor) 4px solid;
    transition: all 250ms ease-in-out;
    transform: perspective(1000px) translateZ(50px);
    position: relative;
    z-index: 999;
  }

  /* prevent white outline box when focused */
  :global(.problem .bx--accordion__heading:focus::before) {
    border: none;
  }
</style>
