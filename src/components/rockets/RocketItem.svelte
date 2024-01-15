<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    StructuredListCell,
    StructuredListRow,
    Tag,
  } from "carbon-components-svelte";
  import { Report } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { derived } from "svelte/store";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  export let rocket: Rocket | undefined = undefined;
  let problemText: string | undefined = undefined;

  let problems = derived(consensusTipState, ($state) => {
    let problems = new Set<string>();
    for (let [id, problem] of $state.Problems) {
      if (problem.Rocket == rocket?.UID) {
        problems.add(id);
      }
    }
    if (rocket?.Problems) {
      if (rocket.Problems.size < problems.size) {
        rocket.Problems = problems;
      }
    }
    return problems;
  });

  $: requiresConsensus = rocket._requriesConsensus.length > 0;

  $: {
    problemText = $consensusTipState.Problems.get(rocket.ProblemID)?.Title;
  }

  function gotoProblems() {
    if (rocket?.ProblemID) {
              let rootProblem = $consensusTipState.Problems.get(
                rocket.ProblemID
              );
              if (rootProblem) {
                let first = [...rootProblem.FullChildren][0]
                if (first) {
                  goto(`${base}/problems/${first.UID}`);
                } else {
                  goto(`${base}/problems/${rocket.ProblemID}`);
                }
              }
            }
  }
</script>

{#if rocket}
  <StructuredListRow>
    <StructuredListCell noWrap
      ><h3>
        {rocket.Name} <a href="{base}/rockets/{rocket.UID}"><Report /></a>
      </h3>
      <CommentUser pubkey={rocket.CreatedBy} /></StructuredListCell
    >
    <StructuredListCell
      >{#if requiresConsensus}<Tag
          interactive
          on:click={() => {
            goto(
              `${base}/FAQ/283c5a5f528369691c1c873ea141c2ed67a0bfdb397aaccb3edbd38586f69beb`
            );
          }}
          type="red">UNCONFIRMED</Tag
        >{/if}
      <Tag
        interactive
        on:click={() => {
          gotoProblems()
        }}>{$problems.size} Problems</Tag
      ><Tag
        interactive
        on:click={() => {
          goto(base + "/rockets/" + rocket.UID + "/merits");
        }}>{rocket.Merits.size} Merit Requests</Tag
      ></StructuredListCell
    >
    <StructuredListCell>
      {#if problemText}<a
          href="#"
          on:click={() => {
            gotoProblems()
          }}>{problemText}</a
        >{/if}
      {#if rocket.Mission}<br />MISSION: {rocket.Mission}{/if}
    </StructuredListCell>
  </StructuredListRow>
{/if}
