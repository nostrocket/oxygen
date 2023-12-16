<script lang="ts">
  import { base } from "$app/paths";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
</script>
{#if rocket}
  <Tile>
    {#if rocket.Name}<h2>ROCKET: {rocket.Name}</h2>{/if}
    {#if rocket.CreatedBy}Rocket launched by: <CommentUser
        pubkey={rocket.CreatedBy}
      />
    {/if}
    {#if problem}
      <hr />
      <h4>{problem.Title}</h4>
      <p style="font-style: italic;">{problem.Summary}</p>
    {/if}
    {#if rocket.Mission}<hr />
      <h4>MISSION: {rocket.Mission}</h4>{/if}
    {#if rocket.MeritMode}
      <hr />
      <h4>
        Consensus Mode: {rocket.MeritMode}
      </h4>{/if}
    <hr />
    <h4>Repositories</h4>
    <ul>
      {#each rocket.Repositories as repo}<li>{repo}</li>{/each}
    </ul>

    {#if rocket.Events.size > 0}
      <hr />
      <h4>Events</h4>
      <ul>
        {#each rocket.Events as event}
          <li>
            <a style="color:deeppink;" href="{base}/eventviewer/{event}"
              >{event}</a
            >
          </li>
        {/each}
      </ul>
    {/if}
  </Tile>
{/if}
