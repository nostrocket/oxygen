<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState, nostrocketMaintiners } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button, Tile } from "carbon-components-svelte";
  import { FolderOpen } from "carbon-icons-svelte";
  import StatusTag from "../../tags/StatusTag.svelte";
  import { CurrentUserCanModify, getRocket } from "./helpers";
  import Close from "../buttons/Close.svelte"
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { derived } from "svelte/store";
  export let problem: Problem;
  export let preview = false;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(problem.Rocket);
  });

  let currentUserCanModify = CurrentUserCanModify(currentUser, rocket, nostrocketMaintiners, problem)
</script>

<Tile
  light
  style="margin-top:2px;{!preview?"cursor:pointer;":""}"
  on:click={() => {
    if (!preview) {
      goto(
        `${base}/${getRocket(problem, $consensusTipState)?.Name}/problems/${
          problem.UID
        }`
      );
    }
  }}
  ><div style="display: inline-block;">
    <span><FolderOpen size={32} /></span><span
      style="position:relative;top:-8px;left:8px;font-size:medium;"
      >{problem.Title}</span
    >
    <div style="float:right;" ><Close currentUserCanModify={$currentUserCanModify} {problem} kind="icon" /><StatusTag {problem} type="open-children" /></div>
  </div></Tile
>
