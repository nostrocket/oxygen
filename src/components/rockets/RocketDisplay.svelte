<script lang="ts">
  import { ConsensusMode } from "$lib/stores/nostrocket_state/hard_state/types";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
</script>

{#if rocket && problem}
  <Tile>
    {#if rocket.Name}<h2>ROCKET: {rocket.Name}</h2>{/if}
    <h4>{problem.Title}</h4>
    <p style="font-style: italic;">{problem.Summary}</p>

    <br />
    {#if rocket.Mission}<h4>MISSION: {rocket.Mission}</h4>{/if}
    {#if rocket.MeritMode}<h4>
        Consensus Mode: {rocket.MeritMode}
      </h4>{/if}
    {#if rocket.Repositories.size > 0}
      <h4>Repositories</h4>
      <ul>
        {#each rocket.Repositories as repo}<li>{repo}</li>{/each}
      </ul>
    {/if}
  </Tile>
{/if}
