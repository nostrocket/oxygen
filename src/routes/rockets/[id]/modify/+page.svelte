<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import ModifyRocket from "../../../../components/rockets/ModifyRocket.svelte";

let rocket:Rocket|undefined;
$: {
    rocket = $consensusTipState.RocketMap.get($page.params.id)
}
</script>
{#if $page.params.id}
<ModifyRocket existing={rocket} />
{/if}