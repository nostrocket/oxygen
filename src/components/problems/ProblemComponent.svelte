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
  import type { Readable } from "svelte/store";
  import ProblemButton from "./ProblemButton.svelte";

  export let problem: Problem;
  export let depth: number;
  export let problemStore: Readable<Map<string, Problem>>;

  $: depthColor = getDepthColor(depth);

  let openState: boolean;

  $: focusProblem = openState ? "problem focus-problem" : "problem";
  let printed = new Map();
  $: if (openState && !printed.get(problem.UID)) {
    printed.set(problem.UID, true);
    console.log(problem);
  }

  let rocketName = ""
  let rocketColour = "purple"

  let problemStatusColor = "green"
  let problemStatusDescription = ""
  $: {
    if ($consensusTipState.RocketMap.get(problem.Rocket)?.Name) {
      rocketName = $consensusTipState.RocketMap.get(problem.Rocket)?.Name
    }
    if (rocketName != "Nostrocket") {
      rocketColour = "teal"
    }
    problemStatusDescription = problem.Status
    switch (problem.Status) {
      case "open":
        problemStatusColor = "green"
        break
      case "claimed":
        problemStatusColor = "gray"
        break
      case "patched":
        problemStatusColor = "cyan"
        break
      case "closed":
        problemStatusColor = "red"
        break
    }
    if (problem.Status == "open" && problem.Children.size > 0) {
      problemStatusColor = "purple"
      problemStatusDescription = "open children"
    }
  }
</script>

<AccordionItem
  class={focusProblem}
  style="margin-left:{depth}%;--depthColor:{depthColor}; padding: 0"
  bind:open={openState}
>
  <svelte:fragment slot="title">
    <h2 class="problem-title">{#if rocketName != "Nostrocket"}<Tag type={rocketColour}>{rocketName}</Tag>{/if}
      {#if problem.Title}{problem.Title}{:else}
        <InlineLoading />
      {/if}
      <Tag type={problemStatusColor}>{problemStatusDescription}</Tag>
    </h2>

    {#if problem.Summary}
      <div class="problem-summary">
        {problem.Summary}
      </div>
    {/if}
  </svelte:fragment>

  <ProblemButton parent={problem} />
  <Button
    on:click={goto(`${base}/problems/${problem.UID}`)}
    size="small"
    kind="tertiary"
    iconDescription="View problem"
    icon={View}>More</Button
  >
</AccordionItem>
{#if problem.Children}
  {#each problem.Children.entries() as [childProblem]}
    {#if $problemStore.get(childProblem)}
      <svelte:self
        {problemStore}
        problem={$problemStore.get(childProblem)}
        depth={depth + 1}
      />
    {/if}
  {/each}
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
