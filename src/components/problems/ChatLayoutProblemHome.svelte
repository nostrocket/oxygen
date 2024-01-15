<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { makeHtml } from "$lib/helpers/mundane";
  import Close from "$lib/icons/Close.svelte";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    Column,
    Row,
    Tag,
    TextInput,
    Tile
  } from "carbon-components-svelte";
  import {
    Category,
    Chat,
    IbmWatsonMachineLearning,
    Maximize,
    RecentlyViewed,
    Rocket
  } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import StatusTag from "../tags/StatusTag.svelte";
  export let selected: Problem;

  $: outerWidth = 0;
  $: innerWidth = 0;
  $: outerHeight = 0;
  $: innerHeight = 0;
  $: height = 0;

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

  $: highlightedChild = "";
</script>

<svelte:window
  bind:innerWidth
  bind:outerWidth
  bind:innerHeight
  bind:outerHeight
/>

<Tile style="clear:both;overflow:auto;margin-top:2px;" light>
  <Column>
    <h4>{selected.Title}</h4>
    <p>{selected.Summary}</p>
    <br />
    <StatusTag problem={selected} />
    <Tag icon={Rocket} interactive type="teal">{rocketName}</Tag>
    <Tag interactive icon={Chat}>{selected.NumberOfComments}</Tag>
    <Tag interactive icon={RecentlyViewed}>{selected.Events.length}</Tag>
    {#each selected.Pubkeys as pk}<CommentUser pubkey={pk} />{/each}
    
    <ButtonSet>
      {#if selected.Status == "open" && selected.Children.size == 0}<Button
          size="small"
          icon={IbmWatsonMachineLearning}>WORK ON THIS NOW</Button
        >{/if}
      {#if selected.Status != "closed" && selected.Children.size == 0}<Button
          kind="danger"
          size="small"
          icon={Close}>CLOSE</Button
        >{/if}
    </ButtonSet>
    <Row style="margin-top:2px;">
      <Column lg={8} style="padding:0;margin:0;">
        {#if selected.FullText?.length > 0}
          <Tile light style="max-height:{height - 50}px;overflow:hidden;">
            {@html makeHtml(selected.FullText)}
          </Tile>
          <Button style="display:flexbox;float:right;clear:both;" icon={Maximize} kind="ghost">VIEW ALL</Button>
        {/if}
      </Column>
      <Column
        lg={selected.FullText?.length > 0 ? 8 : 16}
        style="padding:0;margin:0;"
        ><div bind:clientHeight={height}>
          <Tile style="min-height:130px;clear:both;overflow:auto;">
            <h4 style="font-style: italic;">
              <Tag type="purple" interactive icon={Category}>{selected.Children.size}</Tag> SUB-PROBLEMS
            </h4>
            <Tile>
              <TextInput
                placeholder="Start typing... //todo: levenshtein filter => log new problem"
              />
            </Tile>
            {#each [...selected.FullChildren].slice(0,3) as c}
              <Tile
                on:click={() => {
                  goto(`${base}/problems/${c.UID}`);
                }}
                on:mouseenter={() => {
                  highlightedChild = c.UID;
                }}
                on:mouseleave={() => {
                  highlightedChild = "";
                }}
                light={highlightedChild == c.UID}
                style="cursor:pointer;margin-top:2px;padding:6px;"
              >
                <span style="font-weight:300;line-height:18px">{c.Title}</span>
              </Tile>
            {/each}
            <!-- {#if selected.Children.size > 3}<Button style="display:flexbox;float:right;clear:both;" icon={Maximize} kind="ghost">VIEW ALL</Button>{/if} -->
          </Tile>

          <Tile style="margin-top:10px;max-height:300px;overflow:hidden;display:{selected.NumberOfComments > 0?"block":"none"}">
            <h4><Tag type="purple" interactive icon={Chat}>{selected.NumberOfComments}</Tag>DISCUSSION</h4>
            <CommentsWrapper
              problem={selected}
              parentId={selected.UID}
              isRoot={true}
              disableReplies
              bind:numberOfComments={selected.NumberOfComments}
              onlyOne
            />
          </Tile>
        </div>
        <!-- <Tile style="margin-top:10px;max-height:108px;overflow:hidden;"
            ><h4>{selected.Events.length} EVENTS</h4>
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
          {#if selected.Events.length > 3}<Tile
              ><span style="float:right;"><ChevronDown /> VIEW ALL</span></Tile
            >{/if} -->
      </Column>
    </Row>
  </Column>
</Tile>
