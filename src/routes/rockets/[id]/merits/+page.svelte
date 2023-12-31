<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Accordion,
    Button,
    InlineLoading,
    InlineNotification,
    Tile,
  } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import CommentUser from "../../../../components/comments/CommentUser.svelte";
  import CommentsWrapper from "../../../../components/comments/CommentsWrapper.svelte";
  import CuckLoserBucks from "../../../../components/elements/CuckLoserBucks.svelte";
  import ProblemComponent from "../../../../components/problems/ProblemComponent.svelte";

  let rocket = derived(
    [page, consensusTipState],
    ([$page, $consensusTipState]) => {
      return $consensusTipState.RocketMap.get($page.params.id);
    }
  );

  let repo = derived(rocket, ($r) => {
    if ($r) {
      if ($r.Repositories.size > 0) {
        return new URL($r?.Repositories.entries().next().value[0]).toString();
      }
    }
  });
</script>

{#if !$rocket}<InlineLoading />{/if}
{#if $rocket}
  {#if $rocket.Merits.size == 0}<InlineNotification
      kind="info-square"
      lowContrast
      title="NOTICE"
      subtitle="No merit requests have been found for {$rocket.Name}. This could mean events are still loading."
      ><InlineLoading /></InlineNotification
    >{/if}
  {#each $rocket.Merits as [id, merit]}
    <Tile>
      <p>
        Requested By: <CommentUser pubkey={merit.CreatedBy} />
        <br />
        Amount in Sats: {merit.Amount} (<CuckLoserBucks sats={merit.Amount} />)
        <br />
        <Accordion
          ><ProblemComponent
            onlyShowThisProblem
            dontShowExtraChildren
            problemID={merit.Problem}
          /></Accordion
        >
        <Tile light>
          <h6>If the Contributor has commented on the problem with a link to a commit it will be displayed here:</h6>
          <CommentsWrapper
            disableReplies
            parentId={merit.Problem}
            isRoot={true}
            filter={$repo}
            pubkey={merit.CreatedBy}
          />
        </Tile>
        <Button
          kind="ghost"
          on:click={() => {
            console.log(merit);
          }}>PRINT FULL OBJECT TO CONSOLE</Button
        >
      </p>
    </Tile>
  {/each}
{/if}
