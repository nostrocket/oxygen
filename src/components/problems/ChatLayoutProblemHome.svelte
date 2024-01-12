<script lang="ts">
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    ListItem,
    OrderedList,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { ParentChild, Rocket } from "carbon-icons-svelte";
  import { makeHtml } from "$lib/helpers/mundane";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import Close from "$lib/icons/Close.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import LogNewProblem from "./LogNewProblem.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { nip19 } from "nostr-tools";
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
      <Button
        size="small"
        on:click={() => {
          goto(`${base}/problems/new/${selected.UID}`);
        }}>LOG NEW PROBLEM HERE</Button
      >
    </ButtonSet>
  </Tile>
  {#if selected.FullText?.length > 0}
    {@html makeHtml(selected.FullText)}
  {/if}
  {#if selected.FullText?.length > 0}{/if}
  <Tile style="margin-top:10px;">
    <Tile light
      ><h6>DISCUSSION</h6>
      <CommentsWrapper
        problem={selected}
        parentId={selected.UID}
        isRoot={true}
      />
    </Tile>
    <Tile light style="margin-top:10px;"><h6>History</h6></Tile>
    <OrderedList>
      {#each selected.Events as ev}
      {#if ev}
        <ListItem>
          <a style="color:deeppink;" href="{base}/eventviewer/{ev.id}"
            >{nip19.noteEncode(ev.id)}</a
          >
        </ListItem>
        {/if}
      {/each}
    </OrderedList>
  </Tile>
</Tile>
