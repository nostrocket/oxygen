<script lang="ts">

  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import Problems from "../../../../components/views/Problems.svelte";

  let rocketName = $page.params.rocket
  let rocketID:string|undefined = undefined

  $:{
    $consensusTipState.RocketMap.forEach(r=>{
        if (r.Name.toLowerCase() == rocketName.toLowerCase()) {
            rocketID = r.UID
        }
    })
  }

</script>

{#if rocketID} <Problems rocketID={rocketID}/>{/if}