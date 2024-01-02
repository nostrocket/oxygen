<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Accordion,
    Button,
    ButtonSet,
    InlineLoading,
    InlineNotification,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import { CheckmarkOutline, MisuseOutline } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import CommentUser from "../../../../components/comments/CommentUser.svelte";
  import CommentsWrapper from "../../../../components/comments/CommentsWrapper.svelte";
  import CuckLoserBucks from "../../../../components/elements/CuckLoserBucks.svelte";
  import ProblemComponent from "../../../../components/problems/ProblemComponent.svelte";
  import { notYetImplemented } from "$lib/helpers/mundane";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

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
      {#if merit._requriesConsensus.length > 0}<p><Tag interactive on:click={()=>{goto(`${base}/FAQ/283c5a5f528369691c1c873ea141c2ed67a0bfdb397aaccb3edbd38586f69beb`)}} type="red">UNCONFIRMED</Tag></p>{/if}
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
      </p>
      <ButtonSet>
        <Button on:click={()=>notYetImplemented()} kind="primary" icon={CheckmarkOutline}>RATIFY</Button>
        <Button on:click={()=>notYetImplemented()} kind="secondary" icon={MisuseOutline}>BLACKBALL</Button>
        <Button
        kind="ghost"
        on:click={() => {
          console.log(merit);
        }}>PRINT OBJECT TO CONSOLE</Button
      >
      </ButtonSet>
    </Tile>

  {/each}
{/if}
