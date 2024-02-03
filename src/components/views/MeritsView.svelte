<script lang="ts">
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    InlineLoading,
    InlineNotification
  } from "carbon-components-svelte";
  import ViewMerit from "../merits/ViewMerit.svelte";
export let rocket:Rocket



</script>

{#if rocket.Merits.size == 0}<InlineNotification
    kind="info-square"
    lowContrast
    title="NOTICE"
    subtitle="No merit requests have been found for {rocket.Name}. This could mean events are still loading."
    ><InlineLoading /></InlineNotification
  >{/if}
{#each rocket.Merits as [id, merit]}
  <ViewMerit {rocket} {merit} />
{/each}
