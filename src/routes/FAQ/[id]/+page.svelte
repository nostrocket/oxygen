<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { FAQ } from "$lib/stores/nostrocket_state/types";
  import { Tile } from "carbon-components-svelte";
  import { derived } from "svelte/store";

  let faq_item = derived([consensusTipState, page], ([$cts, $page]) => {
    for (let [id, rocket] of $cts.RocketMap) {
      let faq = rocket.FAQ.get($page.params.id);
      if (faq) {
        return faq;
      }
    }
    return new FAQ();
  });
</script>

{#if $faq_item}
  <Tile>
    <h4>{$faq_item.Question}</h4>
    {#if $faq_item.AnswerSentence}<p>{$faq_item.AnswerSentence}</p>{/if}
  </Tile>
{/if}
