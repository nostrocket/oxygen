<script lang="ts">
  import { page } from "$app/stores";
  import ndk from "$lib/stores/ndk";
  import { eventsInState, mempool } from "$lib/stores/state";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { CodeSnippet, InlineLoading, Tile } from "carbon-components-svelte";
  import { Code } from "carbon-pictograms-svelte";

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
{#if event.id.length == 64} 
<Tile>
    <CodeSnippet
    type="multi"
    code={JSON.stringify(event.rawEvent(),
      null,
      "\t"
    )}
    expanded
    />
    </Tile>
{:else}
<InlineLoading />
{/if}
