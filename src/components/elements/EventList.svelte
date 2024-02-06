<script lang="ts">
  import { base } from "$app/paths";
  import { formatDateTime } from "$lib/helpers/mundane";
  import { kindToDescription } from "$lib/stores/event_sources/kinds";
  import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
  import {
    ListItem,
    OrderedList,
    UnorderedList,
  } from "carbon-components-svelte";
  import { nip19 } from "nostr-tools";
  export let list: string[] | undefined = undefined;
  export let eventList: NDKEvent[] | NostrEvent[] | undefined = undefined;
  export let ordered = false;
  export let truncate = false;
  export let description = false;

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
</script>

{#if ordered && list}
  <OrderedList>
    {#each list as id}
      <ListItem>
        <a style="color:deeppink;" href="{base}/eventviewer/{id}"
          >{id}</a
        >
      </ListItem>
    {/each}
  </OrderedList>
{/if}

{#if !ordered && eventList}
  <UnorderedList>
    {#each eventList as event}
      <ListItem>
        <span>
          <a style="color:deeppink;" href="{base}/eventviewer/{event.id}">
            {#if truncate}[{event.id.substring(0, 8)}]{/if}
            {#if !truncate}{event.id}{/if}
          </a>
        </span>

        <span>
          {#if description}
            {descriptionOfKind(event.kind)}
            {formatDateTime(event.created_at)}
          {/if}
        </span>
      </ListItem>
    {/each}
  </UnorderedList>
{/if}
