<script lang="ts">
  import { page } from "$app/stores";
  import { fetchNoteFromSet } from "$lib/helpers/mundane";
  import { ndk } from "$lib/stores/event_sources/relays/ndk";
  import { mempool } from "$lib/stores/nostrocket_state/master_state";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import {
    CodeSnippet,
    InlineLoading,
    Row,
    Tile,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";

  let event: NDKEvent | undefined = undefined;
  let ev: NDKEvent | undefined = undefined;

  $: {
    if (ev) {
      event = ev;
    }
    if (!event) {
      let m = fetchNoteFromSet(new Set($mempool.values()), $page.params.id!);
      if (m) {
        event = m;
      }
    }
  }

  onMount(async () => {
    let event = fetchNoteFromSet(new Set($mempool.values()), $page.params.id!);
    if (!event && $page.params.id.length == 64) {
      $ndk.fetchEvent($page.params.id).then(e=>{
        if (e) {
          ev = e
        }
      })
    }
  });
</script>

<Row>
  <Tile style="margin-bottom:1%;">
    {#if event?.id.length == 64}
      <CodeSnippet
        type="multi"
        code={JSON.stringify(event.rawEvent(), null, "\t")}
        expanded
      />
    {:else}
      <InlineLoading />
    {/if}
  </Tile>
</Row>
