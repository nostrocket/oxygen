<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { FAQ } from "$lib/stores/nostrocket_state/types";
  import { derived } from "svelte/store";
  import FaqItem from "../../../components/FAQ/FAQItem.svelte";

  let faq_item = derived([consensusTipState, page], ([$cts, $page]) => {
    if ($page.params.id) {
      for (let [id, rocket] of $cts.RocketMap) {
        let faq = rocket.FAQ.get($page.params.id);
        if (faq) {
          return faq;
        }
      }
    }
    return new FAQ();
  });
</script>

{#if $faq_item}
  <FaqItem faq={$faq_item} />
{/if}
