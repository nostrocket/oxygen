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
    breakpointObserver,
  } from "carbon-components-svelte";
  import { View } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import ProblemButton from "./ProblemButton.svelte";
  import RecursiveDepth from "./RecursiveDepth.svelte";

  export let problem: Problem |undefined = undefined;
  export let problemID:string|undefined = undefined;
  //export let depth: number;
  export let problemStore = derived(consensusTipState, ($consensusTipState) => {
    return $consensusTipState.Problems;
  });

  $: {
    if (problemID && !problem) {
      problem = $problemStore.get(problemID)
    }
  }

  export let dontShowExtraChildren = false;

  let size = breakpointObserver()

  $: hideThisProblem = (dontShowExtraChildren && problem?.Status != "open")

  let depthColor:string = ""

  let openState: boolean;

  $: focusProblem = (openState && !dontShowExtraChildren) ? "problem focus-problem" : "problem";
  let rocketName = "";
  let rocketColour = "purple";

  let problemStatusColor = "green";
  let problemStatusDescription = "";
  $: {
    if (problem) {
      depthColor = getDepthColor(problem.Depth)
      if ($consensusTipState.RocketMap.get(problem.Rocket)?.Name) {
        rocketName = $consensusTipState.RocketMap.get(problem.Rocket)?.Name;
      }
      if (rocketName != "Nostrocket") {
        rocketColour = "teal";
      }
      problemStatusDescription = problem.Status;
      switch (problem.Status) {
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
      if (problem.Status == "open" && problem.Children.size > 0) {
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

{#if problem  && !hideThisProblem}
  <AccordionItem
  on:click={()=>{if(dontShowExtraChildren){
    goto(`${base}/problems/${problem.UID}`)
  }}}
    class={focusProblem}
    style="margin-left:{problem.Depth}%;--depthColor:{depthColor}; padding: 0"
    bind:open={openState}
  >
    <svelte:fragment slot="title">
      <h2 class="problem-title">
        {#if rocketName != "Nostrocket"}<Tag type={rocketColour}
            >{rocketName}</Tag
          >{/if}
        {#if problem.Title}{problem.Title}{:else}
          <InlineLoading />
        {/if}
        <Tag type={problemStatusColor}>{problemStatusDescription}</Tag>
      </h2>

      {#if problem.Summary && $size != "sm" && $size != "md"}
        <div class="problem-summary">
          {problem.Summary}
        </div>
      {/if}
    </svelte:fragment>

    {#if problem.Status == "open"}<ProblemButton parent={problem} />{/if}
    <Button
      on:click={() => goto(`${base}/problems/${problem.UID}`)}
      size="small"
      kind="tertiary"
      iconDescription="View problem"
      icon={View}>More</Button
    >
  </AccordionItem>
  {#if problem.Children && !dontShowExtraChildren}
    {#each problem.Children.entries() as [childProblem]}
      {#if $problemStore.get(childProblem)}
        <svelte:self
          {problemStore}
          problem={$problemStore.get(childProblem)}
        />
      {/if}
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
