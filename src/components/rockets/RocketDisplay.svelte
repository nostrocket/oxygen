<script lang="ts">
  import { base } from "$app/paths";
  import type { Account, Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Column, Row, TextInput, Tile } from "carbon-components-svelte";
  import ProfileSmall from "../novoproblems/ProfileSmall.svelte";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { FaceDissatisfiedFilled } from "carbon-icons-svelte";
  import { RecursiveIdentityList, consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
  let maintainers:Account[] = []
</script>

{#if rocket}
  <Tile>
    <Tile>
      <h3>THE PROBLEM:</h3>
      {#if problem}<h5>{problem.Title}</h5>
        <p style="font-style: italic;">{problem.Summary}</p>
      {:else}
        <p>
          The creator of this Rocket hasn't specified which problem it exists to
          solve.
        </p>
        {#if $currentUser?.pubkey == rocket.CreatedBy}Looks like you are the
          creator of this Rocket. It's important to let potential contributors
          know what problem you're trying to solve here.
          //todo: show any existing problems created by current user
          <TextInput placeholder="what problem are you trying to solve?" />
          {/if}
      {/if}
    </Tile>

    <Tile>
      <h3>THE MISSION:</h3>
      {#if rocket.Mission}
        <h6>{rocket.Mission}</h6>
      {:else}
        <p>
          The creator of this Rocket doesn't have any goals or objectives in
          mind.
        </p>
        {#if $currentUser?.pubkey == rocket.CreatedBy}<p>
            Looks like you are the creator of this Rocket. It's important to let
            potential contributors know what your objective is and what you hope
            this Rocket will build or accomplish.
          </p>
          <TextInput placeholder="what are you trying to build?" />
        {/if}{/if}
    </Tile>

    <!-- {#if rocket.MeritMode}

      <h4>
        Consensus Mode: {rocket.MeritMode}
      </h4>{/if} -->
<Tile>
  <h3>REPOSITORIES:</h3>
  <ul>
    {#each rocket.Repositories as repo}<li>{repo}</li>{/each}
  </ul>
  {#if rocket.Repositories.size == 0}
  This Rocket doesn't have any code. You cannot contribute to it unless the creator adds at least one repo <FaceDissatisfiedFilled />.
  {/if}
</Tile>
    
<Tile>
<h3>MAINTAINERS:</h3>
<p>These people can merge pull requests, modify problems, and add new maintainers.</p>
{#each RecursiveIdentityList(rocket.UID, rocket.CreatedBy, $consensusTipState, maintainers, "maintainers") as pubkey}<ProfileSmall {pubkey} />{/each}
</Tile>
    {#if rocket.Events.size > 0}
      <Tile>
      <h3>HISTORY:</h3>
      <ul>
        {#each rocket.Events as event}
          <li>
            <a style="color:deeppink;" href="{base}/eventviewer/{event}"
              >{event}</a
            >
          </li>
        {/each}
      </ul>
    </Tile>
    {/if}
  </Tile>
{/if}
