<script lang="ts">
  import type { Nostrocket, Problem } from "$lib/stores/nostrocket_state/types";
  import { ChevronRight } from "carbon-icons-svelte";
  import RecursiveBreadcrumb from "./RecursiveBreadcrumb.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { rootProblem } from "../../../settings";

  export let problem:Problem;
  export let state:Nostrocket;
</script>

<span on:click={()=>{goto(`${base}/Nostrocket/problems/${rootProblem}`);}} style="vertical-align:top;cursor:pointer;display:inline-block;">Problems</span> <ChevronRight size={16} />
  <RecursiveBreadcrumb {problem} {state} top/>