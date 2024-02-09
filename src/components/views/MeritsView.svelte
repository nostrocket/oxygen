<script lang="ts">
  import '@carbon/charts-svelte/styles.css'
	import { PieChart } from '@carbon/charts-svelte'
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { InlineLoading, InlineNotification, Tile } from "carbon-components-svelte";
  import ViewMerit from "../merits/ViewMerit.svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { profiles } from '$lib/stores/hot_resources/profiles';
  export let rocket: Rocket;

  function getMeritsPerPubkey(r: Rocket): Map<string, number> {
    let total = new Map<string, number>();
    for (let [_, merit] of r.Merits) {
      let existing = total.get(merit.CreatedBy);
      if (existing) {
        if (merit.Ratified) {
          existing! += merit.Amount;
        }
      } else {
        if (merit.Ratified) {
          total.set(merit.CreatedBy, merit.Amount);
        }
      }
    }
    if (total.size == 0) {
      total.set(rocket.CreatedBy, 1)
    }
    return total;
  }

  function convertToGraph(data: Map<string, number> ):{}[] {
    let toReturn = []
    for (let [pubkey, value] of data) {
      let display = pubkey
      let profile = $profiles.get(pubkey)
      if (profile) {
        if (profile.profile?.displayName) {
          display = profile.profile.displayName
        }
        if (profile.profile?.name) {
          display = profile.profile.name
        }
      }
      toReturn.push({"group": display, "value": value})
    }
    return toReturn
  }

  function getTotalMerits(ratified: Map<string, number>):number {
    let total = 0
    for (let [_, v] of ratified) {
      total += v
    }
    return total
  }
</script>

{#if rocket.Merits.size == 0}<InlineNotification
    kind="info-square"
    lowContrast
    title="NOTICE"
    subtitle="No merit requests have been found for {rocket.Name}. This could mean events are still loading."
    ><InlineLoading /></InlineNotification
  >{/if}
<Tile>
<PieChart options={{"title": `${rocket.Name} Merit Distribution`,
"resizable": true,
"height": "600px", "theme": "g100"}} data={convertToGraph(getMeritsPerPubkey(rocket))} />
</Tile>
{#each rocket.Merits as [id, merit]}
  <ViewMerit {rocket} {merit} />
{/each}
