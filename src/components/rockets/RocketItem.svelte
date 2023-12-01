<script lang="ts">
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { StructuredListCell, StructuredListRow, Tag } from "carbon-components-svelte";
  import { Report } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { derived } from "svelte/store";

  export let rocket:Rocket|undefined = undefined
  let problemText:string|undefined = undefined

  let problems = derived(consensusTipState, ($state)=>{
    let problems = new Set<string>()
    for (let [id, problem] of $state.Problems) {
      if (problem.Rocket == rocket?.UID) {
        problems.add(id)
      }
    }
    if (rocket?.Problems) {
      if (rocket.Problems.size < problems.size) {
      rocket.Problems = problems
    }
    }


    return problems
  })

  $: {
      problemText = $consensusTipState.Problems.get(rocket.ProblemID)?.Title
  }

</script>
{#if rocket} 
    <StructuredListRow>
        <StructuredListCell noWrap><h3>{rocket.Name} <a href="{base}/rockets/{rocket.UID}"><Report /></a></h3><CommentUser pubkey={rocket.CreatedBy} /></StructuredListCell>
        <StructuredListCell>{#if !rocket.Consensus}<Tag type="red">UNCONFIRMED</Tag>{/if} <Tag interactive on:click={()=>{window.location.href=base+"/problems/rocket/"+rocket?.Name}}>{$problems.size} Problems</Tag></StructuredListCell>
        <StructuredListCell>
          {#if problemText}<a href="{base}/problems/{rocket.ProblemID}">{problemText}</a>{/if}
          {#if rocket.Mission}<br />MISSION: {rocket.Mission}{/if}        
        </StructuredListCell>
      </StructuredListRow>
  {/if}