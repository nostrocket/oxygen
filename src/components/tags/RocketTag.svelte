<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tag } from "carbon-components-svelte";
  import { derived } from "svelte/store";

  export let rocket: Rocket;
  export let textLink = false;

  let problem = derived(consensusTipState, ($cts) => {
    return $cts.Problems.get(rocket.ProblemID)
  })

  let problems = derived(consensusTipState, ($state) => {
    let p = new Set<string>();
    for (let [id, _problem] of $state.Problems) {
      if (_problem.Rocket == rocket.UID) {
        p.add(id);
      }
    }
    if (rocket.Problems) {
      if (rocket.Problems.size < p.size) {
        rocket.Problems = p;
      }
    }
    return p;
  });

  let numberOfProblems = derived(problems, ($problems) => {
    return $problems.size
  })

  function gotoProblems(): void {
    if ($problem) {
      let first = [...$problem.FullChildren][0];
      if (first) {
        goto(`${base}/problems/${first.UID}`);
      } else {
        goto(`${base}/problems/${rocket.ProblemID}`);
      }
    }
  }
</script>
{#if !textLink}
<Tag
  interactive
  on:click={() => {
    gotoProblems();
  }}>{$numberOfProblems} Problems</Tag
>
{:else}
{#if $problem}
<a
href="#"
on:click={() => {
  gotoProblems();
}}>{$problem.Title}</a
>
{/if}
{/if}
