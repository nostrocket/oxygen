<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { FAQ } from "$lib/stores/nostrocket_state/types";
  import { Button, InlineLoading, Tile } from "carbon-components-svelte";
  import { Add } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import FaqItem from "../../components/FAQ/FAQItem.svelte";
  import LogNewFaq from "../../components/FAQ/LogNewFAQ.svelte";
  import { nostrocketIgnitionEvent } from "../../settings";
  let logNew = false;

  let faqs = derived(consensusTipState, ($cts) => {
    let rocket = $cts.RocketMap.get(nostrocketIgnitionEvent);
    if (rocket) {
      return rocket.FAQ;
    }
    return new Map<String, FAQ>();
  });
</script>

<h2>FAQ</h2>
{#if !logNew}<Button
    icon={Add}
    size="field"
    on:click={() => {
      logNew = true;
    }}>ADD</Button
  >{/if}
{#if logNew}
  <Tile light>
    <h5>ADD A NEW FAQ</h5>
    <LogNewFaq bind:open={logNew} />
  </Tile>
{/if}
{#if !logNew}
  {#if !$faqs || $faqs.size == 0}<InlineLoading /> WAITING FOR EVENTS{/if}
  {#each $faqs as [id, faq]}
    <FaqItem expanded={false} {faq} />
  {/each}
{/if}
