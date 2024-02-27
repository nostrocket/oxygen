<script lang="ts">
	import { consensusTipState } from '$lib/stores/nostrocket_state/master_state';
  import { makeHtml } from "$lib/helpers/mundane";
  import { labelledTag } from "$lib/helpers/shouldBeInNDK";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import NDKSvelte, {
    type ExtendedBaseType,
    type NDKEventStore,
  } from "@nostr-dev-kit/ndk-svelte";
  import {
    Column,
    Row,
    Tile
  } from "carbon-components-svelte";
  import { derived, writable, type Readable } from "svelte/store";
  import { ignitionPubkey } from "../../settings";

  const _articles: NDKSvelte = new NDKSvelte({
    explicitRelayUrls: ["wss://relay.highlighter.com"],
  });

  let s = writable(_articles);
  let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>>;
  let searchResultsToRender: Readable<
    ExtendedBaseType<ExtendedBaseType<NDKEvent>>[]
  >;
  let a1 = derived(consensusTipState, ($cts) => {
    return $cts.Problems.get("2de503da15da33f9d0d9eaa817f9ff3bd105ad410b1df1ca9d4d20db913f3686")
  })

  let initted = false;
  $: {
    if (!initted) {
      initted = true;
      _articles.connect().then(() => {
        console.log("search relay connected");
        searchResults = $s.storeSubscribe<NDKEvent>(
          { authors: [ignitionPubkey] }, //kinds: [31990]
          { closeOnEose: true }
        );
        searchResultsToRender = derived(searchResults, ($results) => {
          let r = $results.filter((x) => {
            let l = labelledTag(x, "", "title");
            if (l) {
              if (x.content.length > 0) {
                return l.length > 0;
              }
            }
          });
          return r;
        });
      });
    }
  }
</script>

<!-- {#if $searchResultsToRender}
  {#each [...$searchResultsToRender] as event}
    <Row padding>
      <Column><Tile><h3>{labelledTag(event, "", "title")}</h3>{@html makeHtml(event.content)}</Tile></Column>
    </Row>
  {/each}
{/if} -->

{#if $a1}
<Row padding>
    <Column><Tile><h3>{$a1.Title}</h3>{@html makeHtml($a1.FullText)}</Tile></Column>
  </Row>
{/if}
