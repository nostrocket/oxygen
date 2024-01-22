<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  //import { Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tag } from "carbon-components-svelte";
  import { YAxis } from "carbon-icons-svelte";
  import { Rocket as RocketIcon } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import NumberOfProblemsInRocket from "../rockets/calculators/NumberOfProblemsInRocket.svelte";

  export let rocket: Rocket;
  export let type: "text-link" | "rocket-tag" | "problem-tag";
  export let gotoFirstInList = false;

  let problem = derived(consensusTipState, ($cts) => {
    return $cts.Problems.get(rocket.ProblemID);
  });

  function gotoProblems(): void {
    if ($problem) {
      let first = [...$problem.FullChildren][0];
      if (first && gotoFirstInList) {
        goto(`${base}/${rocket.Name}/problems/${first.UID}`);
      } else {
        goto(`${base}/${rocket.Name}/problems/${rocket.ProblemID}`);
      }
    }
  }
</script>

{#if type == "problem-tag"}
  <Tag
    interactive
    on:click={() => {
      gotoProblems();
    }}><NumberOfProblemsInRocket {rocket} /> Problems</Tag
  >
{/if}
{#if type == "text-link"}
  {#if $problem}
    <a
      href="#"
      on:click={() => {
        gotoProblems();
      }}>{$problem.Title}</a
    >
  {/if}
{/if}
{#if type == "rocket-tag"}
  <Tag
    icon={RocketIcon}
    interactive
    on:click={() => {
      gotoProblems();
    }}
    type="teal">{rocket.Name}</Tag
  >
{/if}
