<script lang="ts">
  import { page } from "$app/stores";
  import ndk from "$lib/stores/events/ndk";
  import { eventsInState, mempool } from "$lib/consensus/state";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { CodeSnippet, InlineLoading, Row, Tile } from "carbon-components-svelte";

  let event = new NDKEvent($ndk);;
  let haveEvent = false;

  $: {
   let  m = $mempool.get($page.params.id)
   let  s = $eventsInState.get($page.params.id)

   if (m) {
    event = m
   }

   if (s) {
    event = s
   }
  }
</script>
<Row>
<Tile style="margin-bottom:1%;">
{#if event.id.length == 64} 

    <CodeSnippet
    type="multi"
    code={JSON.stringify(event.rawEvent(),
      null,
      "\t"
    )}
    expanded
    />
    
{:else}
<InlineLoading />
{/if}
</Tile>
</Row>