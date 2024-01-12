<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Loading
  } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import ChatLayout from "../../../components/problems/ChatLayout.svelte";

  let problem = derived([page, consensusTipState], ([$page, $cts])=>{
    return $cts.Problems.get($page.params.id)
  })

  $:{
    console.log($page.url.searchParams)
  }

</script>

{#if $problem}
<ChatLayout selected={$problem} />
{:else}
<Loading />
{/if}