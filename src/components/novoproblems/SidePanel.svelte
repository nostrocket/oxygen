<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    Tag,
    TextInput,
    Tile,
    Truncate,
  } from "carbon-components-svelte";
  import {
    ChatBot,
    Edit,
    FolderOpen,
    FolderParent,
    Lightning,
    Send
  } from "carbon-icons-svelte";
  import ProfileSmall from "../elements/ProfileSmall.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  import StatusTag from "./tags/StatusTag.svelte";
  import { getParents, getRocket } from "./elements/helpers";

  export let problem: Problem;
  export let currentUserCanModify = false;
  export let publish: () => void;

  let newParent = "";
  let edit = false;
  $: allParents = getParents(problem, $consensusTipState);
</script>

<!-- Parents -->
{#if allParents}
  {#each allParents as parent}
    <Tile light style="margin-top:2px;">
      <div
        style="cursor:pointer;"
        on:click={() => {
          goto(
            `${base}/nr/${getRocket(parent, $consensusTipState)?.Name}/problems/${
              parent.UID
            }`
          );
        }}
      >
        <Truncate
          ><FolderParent size={24} />
          <span style="position:relative;top:-5px;">{parent.Title}</span
          ></Truncate
        >
      </div>

      {#if currentUserCanModify}<Tile light style="margin:0;padding:0;"
          ><Button
            on:click={() => {
              edit = true;
            }}
            kind="ghost"
            icon={Edit}>CHANGE PARENT</Button
          ></Tile
        >{/if}
      {#if edit}
        <TextInput
          placeholder="UID of new parent"
          bind:value={newParent}
        /><Button
          icon={Send}
          on:click={() => {
            if (newParent.length != 64) {
              throw new Error("must be 64 hex chars");
            }
            problem.Parents = new Set();
            problem.Parents.add(newParent);
            publish();
          }}>PUBLISH</Button
        >{/if}
    </Tile>
  {/each}
{/if}
<!-- Tags -->
<Tile light style="margin-top:2px;">
  <RocketTag
    rocket={getRocket(problem, $consensusTipState)}
    type="rocket-tag"
  />
  <StatusTag {problem} type="standard" />
  {#if problem.Status == "open"}<StatusTag {problem} type="open-children" />{/if}
  {#if problem.FullChildren.size > 0}
    <Tag
      icon={FolderOpen}
      interactive
      type="purple"
      on:click={() => {
        goto(
          `${base}/nr/${getRocket(problem, $consensusTipState)?.Name}/problems/${
            problem.UID
          }?tab=sub-problems`
        );
      }}>{problem.FullChildren.size} sub-problems</Tag
    >
  {/if}
  {#if problem.TotalActivity() > 0}<Tag
      interactive
      type="cyan"
      icon={ChatBot}
      on:click={() => {
        goto(
          `${base}/nr/${getRocket(problem, $consensusTipState)?.Name}/problems/${
            problem.UID
          }?tab=discussion`
        );
      }}>{problem.TotalActivity()} comments</Tag
    >{/if}
  <Tag type="high-contrast" icon={Lightning}>0 sats</Tag>
</Tile>
<Tile light style="margin-top:2px;">
  {#each problem.Pubkeys as pubkey}<ProfileSmall {pubkey} />{/each}
</Tile>
