<script lang="ts">
  import { base } from "$app/paths";
  import { unixTimeNow } from "$lib/helpers/mundane";
  import { kindToDescription } from "$lib/stores/event_sources/kinds";
  import {
    Column,
    InlineNotification,
    ListItem,
    OrderedList,
    Row,
    Tile,
    UnorderedList,
  } from "carbon-components-svelte";
  import { consensusTipState, eligibleForProcessing, inState, notesInState } from "$lib/stores/nostrocket_state/master_state";

function descriptionOfKind(kind:number) {
    if (kind) {
      let sc = kindToDescription(kind);
      if (sc) {
        return sc;
      }
    }
    return "";
  };

  function timeSince(unixTimestamp:number) {
    new Date(unixTimestamp);
  }
</script>

<Row>
  <Column max={8} sm={8}>
    <h1>Consensus Event Chain</h1>
    <OrderedList>
      {#each $consensusTipState.ConsensusEvents as id}
        <ListItem>
          <a style="color:deeppink;" href="{base}/eventviewer/{id}">{id}</a>
        </ListItem>
      {/each}
    </OrderedList>

    <h1>Events in Current State</h1>
    <h6>
      These events are valid under the Nostrocket Unprotocol and have caused a
      change to the Nostrocket state displayed in this app
    </h6>
    {#if $inState.size == 0}
      <InlineNotification lowContrast kind="info">
        <h4>Waiting for events</h4>
      </InlineNotification>
    {/if}
    <UnorderedList>
      {#each [...$notesInState.sort((a, b) => {
          if (a.created_at > b.created_at) {
            return -1;
          } else {
            return 1;
          }
        })] as event}
        <ListItem>
          <span
            ><a style="color:deeppink;" href="{base}/eventviewer/{event.id}"
              >[{event.id.substring(0, 8)}]</a
            ></span
          >
          <span
            >{descriptionOfKind(event.kind)}
            {(unixTimeNow() - event.created_at).toLocaleString()} secs ago
          </span>
        </ListItem>
      {/each}
    </UnorderedList>
  </Column>

  <Column max={8} sm={8}>
    <h1>Events in Mempool</h1>
    <h6>
      This list may contain events that are invalid under the Nostrocket
      Unprotocol
    </h6>
    {#if $eligibleForProcessing.length == 0}
      <InlineNotification lowContrast kind="info">
        <h4>There are no events waiting to be merged into the current state</h4>
      </InlineNotification>
    {/if}
    <Row>
      <UnorderedList>
        {#each $eligibleForProcessing.sort((a, b) => {
          if (a.created_at > b.created_at) {
            return -1;
          } else {
            return 1;
          }
        }) as event}
          <ListItem>
            <span
              ><a style="color:deeppink;" href="{base}/eventviewer/{event.id}"
                >[{event.id.substring(0, 8)}]</a
              ></span
            >
            <span
              >{descriptionOfKind(event.kind)}
              {(unixTimeNow() - event.created_at).toLocaleString()} secs ago
            </span>
          </ListItem>
        {/each}
      </UnorderedList>
    </Row>
  </Column>


</Row>
