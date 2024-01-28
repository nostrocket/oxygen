<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState, nostrocketMaintiners } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  import { FolderOpen } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import StatusTag from "../../tags/StatusTag.svelte";
  import Close from "../buttons/Close.svelte";
  import { CurrentUserCanModify, getRocket } from "./helpers";
  export let problem: Problem;
  export let preview = false;
  export let searchMatch = 0;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(problem.Rocket);
  });

  let currentUserCanModify = CurrentUserCanModify(currentUser, rocket, nostrocketMaintiners, problem)
</script>

<Tile
  light
  style="margin-top:2px;"
  
  ><div style="display: inline-block;">
    <span>{#if searchMatch == 0}<FolderOpen size={32} />{:else}{searchMatch.toFixed(2)}{/if}</span><span on:click={() => {
      if (!preview) {
        goto(
          `${base}/${getRocket(problem, $consensusTipState)?.Name}/problems/${
            problem.UID
          }`
        );
      }
    }}
      style="position:relative;top:-8px;left:8px;font-size:medium;{!preview?"cursor:pointer;":""}"
      >{problem.Title}</span
    >
    <div style="float:right;" ><Close currentUserCanModify={$currentUserCanModify} {problem} kind="icon" /><StatusTag {problem} type="open-children" /></div>
  </div></Tile
>
