<script lang="ts">
  import { UpdateStatus } from "$lib/helpers/publishProblem";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/problems";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button } from "carbon-components-svelte";
  import { Close } from "carbon-icons-svelte";
  import Helpers from "../Helpers.svelte";
  import type { Readable } from "svelte/store";

  export let kind: "icon" | "button"
  export let problem:Problem;
  export let currentUserCanModify = false;

  let hasOpen: Readable<boolean | undefined>;

</script>
<Helpers bind:hasOpenChildren={hasOpen} {problem} />

{#if problem && currentUserCanModify}

{#if kind=="icon"} 
<Button disabled={hasOpenChildren(problem, $consensusTipState)} on:click={()=>{UpdateStatus(problem, "closed")}} size="small" kind="danger-ghost" icon={Close} />
{/if}

{/if}