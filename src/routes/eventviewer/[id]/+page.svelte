<script lang="ts">
  import { page } from "$app/stores";
  import { fetchNoteFromSet } from "$lib/helpers/mundane";
  import { mempool } from "$lib/stores/nostrocket_state/master_state";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import {
    CodeSnippet,
    InlineLoading,
    Row,
    Tile,
  } from "carbon-components-svelte";

  let event:NDKEvent|undefined = undefined;
  let haveEvent = false;

  $: {
    let m = fetchNoteFromSet(new Set($mempool.values()), $page.params.id!);
    if (m) {
      event = m;
    }
  }
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
