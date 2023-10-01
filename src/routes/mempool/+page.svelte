<script>
    import ndk from "$lib/stores/ndk";
    import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
    import { Rocket } from "carbon-pictograms-svelte";
    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import { AspectRatio, Column, Grid, InlineNotification, ListItem, OrderedList, Row, Tile } from "carbon-components-svelte";
    import CreateRocket from "../../components/modals/CreateRocket.svelte";
    import { allNostrocketEvents, consensusTipState, eventsInState, mempool, notPrecalculatedStateEvents, rocketMap, validConsensusEvents } from "$lib/stores/state";
  import { kindToDescription, kindToText } from "$lib/kinds";
  import { ListChecked } from "carbon-icons-svelte";

  let descriptionOfKind = function(/** @type {any} */ kind) {
    if (kind) {
      let sc = kindToDescription(kind)
      if (sc) {
        return sc
      }
    }
    return ""
  }
  </script>
<Row>


<Column max={8} sm={8}>
<h1>Events Waiting in Mempool</h1>
{#if $mempool.size==0}
<InlineNotification
lowContrast
kind="info">
<h4>There are no events waiting to be merged into the current state</h4>
</InlineNotification>
{/if}

<Row>
  {#each [...$mempool] as [key, event]}
  <Column max={4}>
    <Tile style="margin:1px;">
       <!-- <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} /> -->
       <h6><Rocket />{event.id.substring(0, 8)}...</h6>
       <p>Kind: {event.kind}</p>
       <p>{descriptionOfKind(event.kind)}</p>
       <a href="{base}/eventviewer/{event.id}">More...</a>
      </Tile>
  </Column>
  {/each}
  </Row>
</Column>

<Column max={8} sm={8}>
  <h1>Events in Current State</h1>
  {#if $eventsInState.size==0}
<InlineNotification
lowContrast
kind="info">
<h4>Waiting for events</h4>
</InlineNotification>
{/if}
<Row>
  {#each [...$eventsInState] as [s, event]}
  <Column max={4}>
    <Tile style="margin:1px;">
       <h6>{event.id.substring(0, 8)}...</h6>
       <p>Kind: {event.kind}</p>
       <p>{descriptionOfKind(event.kind)}</p>
       <a href="{base}/eventviewer/{event.id}">More...</a>
      </Tile>
  </Column>
  {/each}
  </Row>
</Column>

<Column max={8} sm={8}>
  <h1>Consensus Event Chain</h1>
  <OrderedList>
  {#each $consensusTipState.ConsensusEvents as id}
       <ListItem>{id.substring(0,16)}... <a href="{base}/eventviewer/{id}">view details</a></ListItem>
  {/each}
  </OrderedList>
</Column>


</Row>