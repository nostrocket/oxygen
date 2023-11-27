<script lang="ts">
  import { ConsensusMode } from "$lib/stores/nostrocket_state/hard_state/types";
import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
</script>

{#if problem}
<Tile>
    <h4>{problem.Title}</h4>
    <p style="font-style: italic;">{problem.Summary}</p>
  {#if rocket}
  <br />
  {#if rocket.Mission}<h4>MISSION: {rocket.Mission}</h4>{/if}
  {#if rocket.ConsensusMode}<h4>Consensus Mode: {rocket.ConsensusMode}</h4>{/if}
  {#each rocket.Repositories as repo}{repo}<br />{/each}
  {/if}
</Tile>
{/if}