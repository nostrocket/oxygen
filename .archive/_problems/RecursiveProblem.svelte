<script lang="ts">
  import { page } from "$app/stores";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  import { Edit, YAxis } from "carbon-icons-svelte";
  import ProblemDetail from "./ProblemDetail.svelte";
  import { derived } from "svelte/store";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/problems";
  import ProblemTile from "./ProblemTile.svelte";
  export let problem: Problem;
  export let depth = 0;
  export let focus: string;
  $: greyedOut = problem.RenderData.grey && focus != problem.UID;
  $: expanded = focus == problem.UID;
  $: edit = false;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(problem.Rocket);
  });

  let currentUserIsMaintainer = derived(
    [currentUser, rocket],
    ([$currentUser, $rocket]) => {
      if ($currentUser) {
        if ($rocket?.Maintainers.has($currentUser?.pubkey)) {
          return true;
        }
      }
      return false;
    }
  );

  let claimable = derived(consensusTipState, ($cts) => {
    return !hasOpenChildren(problem, $cts) && problem.Status == "open";
  });

  console.log($page.url.searchParams.get("status"));
</script>

{#if problem}
  {#if !problem.RenderData.hidden}
    <ProblemTile
      light={expanded}
      style="margin-top:0.1%;margin-left:{depth}%;color:{greyedOut
        ? 'grey'
        : ''};"
    >
      {#if expanded}
        {#each problem.Parents as parentID}
          <a
            href="#"
            on:click={() => {
              focus = parentID;
            }}><YAxis /></a
          >
        {/each}
        {#if currentUserIsMaintainer || $currentUser?.pubkey == problem.CreatedBy}
          <a
            style="float: right;"
            href="#"
            on:click={() => {
              edit = !edit;
            }}><Edit /></a
          >{/if}
      {/if}
      <h6>
        <span
          style="cursor: pointer;"
          on:click={() => {
            focus = problem.UID;
          }}>{problem.Title}</span
        >
      </h6>
      <!-- {#if !greyedOut && problem.Summary != problem.Title}
        <div class="problem-summary">
          {problem.Summary}
        </div>{/if} -->
      {#if expanded}
        <ProblemDetail
          currentUserIsMaintainer={$currentUserIsMaintainer}
          claimable={$claimable}
          {problem}
          rocket={$rocket}
          {edit}
        />
        {#each problem.FullChildren as child}
          <svelte:self problem={child} depth={depth + 1} bind:focus />
        {/each}
      {/if}
    </ProblemTile>

    {#if !expanded}
      {#each problem.FullChildren as child}
        <svelte:self problem={child} depth={depth + 1} bind:focus />
      {/each}
    {/if}
  {/if}
{/if}

<style>
</style>
