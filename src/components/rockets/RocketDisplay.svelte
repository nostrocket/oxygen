<script lang="ts">
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived, writable } from "svelte/store";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
  export let modify = false;

  let reactiveRocket = derived(consensusTipState, ($consensusTipState) => {
    if (rocket?.UID && !modify) {
      return $consensusTipState.RocketMap.get(rocket.UID);
    }
    return undefined;
  });
</script>

{#if $reactiveRocket}
  <Tile>
    {#if $reactiveRocket.Name}<h2>ROCKET: {$reactiveRocket.Name}</h2>{/if}
    {#if $reactiveRocket.CreatedBy}Rocket launched by: <CommentUser
        pubkey={$reactiveRocket.CreatedBy}
      />
    {/if}
    {#if problem}
      <hr />
      <h4>{problem.Title}</h4>
      <p style="font-style: italic;">{problem.Summary}</p>
    {/if}
    {#if $reactiveRocket.Mission}<hr />
      <h4>MISSION: {$reactiveRocket.Mission}</h4>{/if}
    {#if $reactiveRocket.MeritMode}
      <hr />
      <h4>
        Consensus Mode: {$reactiveRocket.MeritMode}
      </h4>{/if}
    <hr />
    <h4>Repositories</h4>
    <ul>
      {#each $reactiveRocket.Repositories as repo}<li>{repo}</li>{/each}
    </ul>

    {#if $reactiveRocket.Events.size > 0}
      <hr />
      <h4>Events</h4>
      <ul>
        {#each $reactiveRocket.Events as event}
          <li>
            <a style="color:deeppink;" href="{base}/eventviewer/{event}"
              >{event}</a
            >
          </li>
        {/each}
      </ul>
    {/if}
  </Tile>
  <!-- todo: I don't understand svelte reactivity here, programmatic changes to `rocket` based on events are NOT REACTIVE unless I use a store, but when using a store the user input is NOT REACTIVE. Solution: fucking repeat everything so that this component works in both situations, and hopefully a javascript person knows what kind of fucking black magic witch doctor shit is going on here. -->
{:else if rocket}
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
