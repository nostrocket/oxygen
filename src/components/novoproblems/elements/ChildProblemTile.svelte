<script lang="ts">
  import { goto } from "$app/navigation";
  import { Tile } from "carbon-components-svelte";
  import { FolderOpen } from "carbon-icons-svelte";
  import { getRocket } from "./helpers";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { base } from "$app/paths";
  export let problem: Problem;
  export let preview = false;
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
  </div></Tile
>
