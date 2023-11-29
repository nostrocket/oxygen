<script lang="ts">
  import { page } from "$app/stores";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { InlineNotification, Row } from "carbon-components-svelte";
  import LoginNip07Button from "../../../../components/elements/LoginNIP07Button.svelte";
  import LogNewProblem from "../../../../components/problems/LogNewProblem.svelte";
  let parentID = $page.params.parent;
  let parent:Problem|undefined = undefined
  $:{
    parent = $consensusTipState.Problems.get(parentID)
  }
</script>

{#if parent}
<LogNewProblem {parent} />
{/if}