<script lang="ts">
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button, ButtonSet, Tag, Tile } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { ParentChild, Rocket } from "carbon-icons-svelte";
  import { makeHtml } from "$lib/helpers/mundane";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import Close from "$lib/icons/Close.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  export let selected: Problem;

  function pubkey(p: Problem) {
    return selected.CreatedBy;
  }

  let problemStatusColor = "green";
  let problemStatusDescription = "";
  let rocketName: string | undefined;
  $: {
    //depthColor = getDepthColor(selected.Depth);
    if ($consensusTipState.RocketMap.get(selected.Rocket)?.Name) {
      rocketName = $consensusTipState.RocketMap.get(selected.Rocket)?.Name;
    }
    problemStatusDescription = selected.Status;
    switch (selected.Status) {
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
    if (selected.Status == "open" && selected.Children.size > 0) {
      problemStatusColor = "purple";
      problemStatusDescription = "open children";
    }
  }
</script>

<Tile light style="margin-left:2px;margin-top:2px;">
  <h4>{selected.Title}</h4>
  <p>{selected.Summary}</p>
  <Tile style="margin-top:1%;">
    <CommentUser pubkey={pubkey(selected)} />
    {#if selected.Children.size > 0}<Tag type="green"
        ><ParentChild />{selected.Children.size}</Tag
      >{/if}
    <Tag type={problemStatusColor}>{problemStatusDescription}</Tag>
    <Tag type="teal">{rocketName}</Tag>
    <ButtonSet>
      {#if selected.Status == "open" && selected.Children.size == 0}<Button
          size="small"
          icon={Rocket}>WORK ON THIS NOW</Button
        >{/if}
      {#if selected.Status != "closed" && selected.Children.size == 0}<Button
          kind="danger"
          size="small"
          icon={Close}>CLOSE</Button
        >{/if}
    </ButtonSet>
  </Tile>
  {#if selected.FullText?.length > 0}
    {@html makeHtml(selected.FullText)}
  {/if}
  {#if selected.FullText?.length > 0}{/if}
  <Tile style="margin-top:10px;">
  <Tile light><h6>DISCUSSION</h6>
    <CommentsWrapper problem={selected} parentId={selected.UID} isRoot={true} />
  </Tile>
</Tile>
</Tile>
