<script lang="ts">
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import {
    consensusTipState,
    mempool,
  } from "$lib/stores/nostrocket_state/master_state";
  import { Button, Column, Row, Tile } from "carbon-components-svelte";
  import { Rocket } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import CommentUser from "../../components/comments/CommentUser.svelte";
  import {
    ZAPS_ENABLED,
    nostrocketIgnitionEvent,
    rootProblem,
  } from "../../settings";

  $: e = $mempool.get(rootProblem);

  async function zap() {
    console.log("zap");
    //let e = $mempool.get(nostrocketIgnitionEvent)
    if (!e) {
      throw new Error("event not found");
    }
    if ($rocket) {
      $profiles.get($rocket?.CreatedBy);
    }

    e.zap(1000, undefined, [["e", nostrocketIgnitionEvent]]);
    console.log(e);
  }

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(nostrocketIgnitionEvent);
  });
</script>

<h2>Nostrocket Products</h2>

<Tile
  ><p>
    Rockets should ultimately produce products/services that people want to pay
    for.
  </p>
</Tile>
{#if $rocket}
  <Tile light style="margin-top:2px">
    <Row
      ><Column
        ><h3>Githole: one push away from world domination</h3>
        <p>What you get:</p>
        <ul>
          <li>A public git repository to use as the home for your project</li>
          <li>Use all your existing git tooling and workflow</li>
          <li>No passwords, just your nostr identity</li>
          <li>Add maintainers simply by publishing their npubs</li>
          <li>inter-operability with any NIP34 client</li>
          <li>Zero exit costs, migrate to your own server at any time</li>
        </ul></Column
      ><Column><img style="margin:10px" src="/img/r.jpg" width="300px" /></Column></Row
    >

    <Button
      disabled={!e}
      on:click={() => {
        if (!ZAPS_ENABLED) {
          alert("coming soon");
        } else {
          zap();
        }
      }}
      icon={Rocket}>BUY NOW</Button
    >
  </Tile>
{/if}

<style>
  h3 {
    margin-bottom: 10px;
  }
  li {
    margin-top: 10px;
  }
  ul {
    list-style-position: inside;
    line-height: 140%;
    list-style-type: square;
    margin: 1%;
    font-size: 12pt;
  }
</style>
