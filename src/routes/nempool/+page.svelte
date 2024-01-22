<script lang="ts">
  import { base } from "$app/paths";
  import {
    consensusTipState,
    hardStateErrors,
    inState,
    mempool,
  } from "$lib/stores/nostrocket_state/master_state";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import {
    Column,
    InlineNotification,
    Row
  } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import EventList from "../../components/elements/EventList.svelte";

  let notesInState = derived([inState, mempool], ([$in, $mem]) => {
    let filtered = [...$mem.values()].filter((e) => {
      return $in.has(e.id);
    });
    return filtered;
  });

  let eligibleForProcessing = derived(
    [inState, mempool],
    ([$inState, $mempool]) => {
      let a = Array.from($mempool, ([id, e]) => e);
      a = a.filter((ev: NDKEvent) => {
        return !$inState.has(ev.id);
      });
      return a;
    }
  );

  function errorHasEventID(err:Error):boolean {
    if (err) {
      if (err.cause) {
        if (String(err.cause).length == 64) {
          return true
        }
      }
    }
    return false
  }
</script>

<Row>
  <Column max={8} sm={8}>
    <h1>Consensus Events</h1>
    These are HARD state change requests that votepower has validated and inserted
    into their state.
    <EventList ordered list={$consensusTipState.ConsensusEvents} />
    <!-- <OrderedList>
      {#each $consensusTipState.ConsensusEvents as id}
        <ListItem>
          <a style="color:deeppink;" href="{base}/eventviewer/{id}"
            >{nip19.noteEncode(id)}</a
          >
        </ListItem>
      {/each}
    </OrderedList> -->

    <h1>Active State Change Events</h1>
    These are valid HARD and SOFT state change requests which are active in the current
    state of this application.
    {#if $inState.size === 0}
      <InlineNotification lowContrast kind="info">
        <h4>Waiting for events</h4>
      </InlineNotification>
    {/if}
    <EventList truncate description eventList={[...$notesInState.sort((a, b) => {
      if (a.created_at > b.created_at) {
        return -1;
      } else {
        return 1;
      }
    })]} />
    
  </Column>

  <Column max={8} sm={8}>
    <h1>Events in Nempool</h1>
    This list contains state change requests which are NOT active in the current
    state of this application, they could be waiting for consensus or might be invalid.
    {#if $eligibleForProcessing.length === 0}
      <InlineNotification lowContrast kind="info">
        <h4>There are no events waiting to be merged into the current state</h4>
      </InlineNotification>
    {/if}
    <Row>
      <EventList description truncate eventList={$eligibleForProcessing.sort((a, b) => {
        if (a.created_at > b.created_at) {
          return -1;
        } else {
          return 1;
        }
      })} />
      
    </Row>
  </Column>
  <Column max={8} sm={8}>
    <h1>HARD STATE ERROR LOG</h1>
    <ul>
      {#each $hardStateErrors as hse}
      {#if errorHasEventID(hse)} 
      <li>
        {hse.name}: {hse.message} <a style="color:deeppink;" href="{base}/eventviewer/{String(hse.cause)}">
          [{String(hse.cause).substring(0, 8)}]
        </a>
      </li>
        {/if}
      {/each}
      </ul>
  </Column>
</Row>
