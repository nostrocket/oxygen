<script lang="ts">
  import { InlineNotification } from "carbon-components-svelte";
  import LoginNip07Button from "./LoginNIP07Button.svelte";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  export let reason:string = "";

  let message = "you must login to proceed"

  $:{if (reason != "") {
    message = "you must login to " + reason
  }}
</script>

{#if !$currentUser} 
<InlineNotification kind="info-square" lowContrast title="NOTICE" subtitle={message}><span style="position:absolute;top:8px;right:8px;"><LoginNip07Button /></span></InlineNotification>
{/if}