<script lang="ts">
  import { base } from "$app/paths";
  import { kindToDescription } from "$lib/stores/event_sources/kinds";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
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
    ListItem,
    OrderedList,
    Row,
    Tile,
    UnorderedList,
  } from "carbon-components-svelte";
  import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds,
    differenceInYears,
    format,
  } from "date-fns";
  import { nip19 } from "nostr-tools";
  import { derived } from "svelte/store";

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

  function descriptionOfKind(kind: number) {
    if (kind) {
      let sc = kindToDescription(kind);
      if (sc) {
        return sc;
      }
    }
    return "";
  }

  function timeSince(unixTimestamp: number) {
    new Date(unixTimestamp);
  }

  // TODO: move function to $lib/helpers/mundane.ts when pending PRs are merged
  const formatDateTime = (unixTimestamp: number): string => {
    const now = new Date();
    const timestampDate = new Date(unixTimestamp * 1000);

    const diffInSeconds = differenceInSeconds(now, timestampDate);
    const diffInMinutes = differenceInMinutes(now, timestampDate);
    const diffInHours = differenceInHours(now, timestampDate);
    const diffInDays = differenceInDays(now, timestampDate);
    const diffInMonths = differenceInMonths(now, timestampDate);
    const diffInYears = differenceInYears(now, timestampDate);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 3) return `${diffInDays} days ago`;
    if (diffInMonths < 11) return format(timestampDate, "d MMM, h:mm a");
    if (diffInMonths >= 11 || diffInYears >= 1)
      return `${diffInYears} years ago`;

    return "";
  };

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
    <OrderedList>
      {#each $consensusTipState.ConsensusEvents as id}
        <ListItem>
          <a style="color:deeppink;" href="{base}/eventviewer/{id}"
            >{nip19.noteEncode(id)}</a
          >
        </ListItem>
      {/each}
    </OrderedList>

    <h1>Active State Change Events</h1>
    These are valid HARD and SOFT state change requests which are active in the current
    state of this application.
    {#if $inState.size === 0}
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
          <span>
            <a style="color:deeppink;" href="{base}/eventviewer/{event.id}">
              [{event.id.substring(0, 8)}]
            </a>
          </span>

          <span>
            {descriptionOfKind(event.kind)}
            {formatDateTime(event.created_at)}
          </span>
        </ListItem>
      {/each}
    </UnorderedList>
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
      <UnorderedList>
        {#each $eligibleForProcessing.sort((a, b) => {
          if (a.created_at > b.created_at) {
            return -1;
          } else {
            return 1;
          }
        }) as event}
          <ListItem>
            {#if event.pubkey == $currentUser?.pubkey}
              <span>[MINE]</span>
            {/if}
            <span>
              <a style="color:deeppink;" href="{base}/eventviewer/{event.id}">
                [{event.id.substring(0, 8)}]
              </a>
            </span>

            <span>
              {descriptionOfKind(event.kind)}
              {formatDateTime(event.created_at)}
            </span>
          </ListItem>
        {/each}
      </UnorderedList>
    </Row>
  </Column>
  <Column max={8} sm={8}>
    <h1>HARD STATE ERROR LOG</h1>
    <Row>
      {#each $hardStateErrors as hse}
      {#if errorHasEventID(hse)} 
        {hse.name}: {hse.message} <a style="color:deeppink;" href="{base}/eventviewer/{String(hse.cause)}">
          [{String(hse.cause).substring(0, 8)}]
        </a>
        <br />
        {/if}
      {/each}
    </Row>
  </Column>
</Row>
