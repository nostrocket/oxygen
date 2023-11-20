<script lang="ts">
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { StructuredListCell, StructuredListRow, Tag } from "carbon-components-svelte";
  import { Report, Usb } from "carbon-icons-svelte";
  import { get } from "svelte/store";

  export let rocket:Rocket|undefined = undefined
  let problemText:string|undefined = undefined
  let problemRoute:string = "#"
  $: {
    if (rocket && !problemText) {
      problemText = get(consensusTipState).Problems.get(rocket.ProblemID)?.Title
      problemRoute = base+"/problems/"+rocket.ProblemID
    }
  }

</script>
{#if rocket} 
    <StructuredListRow>
        <StructuredListCell noWrap><h3>{rocket.Name} <a href="{base}/rockets/{rocket.UID}"><Report /></a></h3></StructuredListCell>
        <StructuredListCell>{#if !rocket.Consensus}<Tag type="red">UNCONFIRMED</Tag>{/if} <Tag interactive on:click={()=>{window.location.href=base+"/problems/rocket/"+rocket?.Name}}>{rocket.Problems.size} Problems</Tag></StructuredListCell>
        <StructuredListCell>
          {#if problemText}<a href="{base}/problems/{rocket.ProblemID}">{problemText}</a>{/if}        
        </StructuredListCell>
      </StructuredListRow>
  {/if}