<script lang="ts">
  import { Button, ExpandableTile, Tile } from "carbon-components-svelte";
  import { Add, Edit } from "carbon-icons-svelte";
  import LogNewFaq from "../../components/FAQ/LogNewFAQ.svelte";
  import { nostrocketIgnitionEvent } from "../../settings";
  import { derived } from "svelte/store";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { FAQ } from "$lib/stores/nostrocket_state/types";
  let logNew = false;

  export let rocketID = nostrocketIgnitionEvent;

  let faqs = derived(consensusTipState, ($cts) => {
    let rocket = $cts.RocketMap.get(rocketID)
    if (rocket) {
        return rocket.FAQ
    }
    return new Map<String, FAQ>()
  })

</script>

<h2>FAQ</h2>
{#if !logNew}<Button icon={Add} size="field" on:click={()=>{logNew=true}}>ADD</Button>{/if}
{#if logNew}
<Tile light>
  <h5>ADD A NEW FAQ</h5>
  <LogNewFaq bind:open={logNew} />
</Tile>
{/if}
{#each $faqs as [id, faq]}
<ExpandableTile style="margin-top:1%">
    <div slot="above">
        <h4>{faq.Question}</h4>
        {#if faq.AnswerSentence}<p>{faq.AnswerSentence}</p>{/if}
    </div>
    <div slot="below">
        {#if faq.AnswerParagraph}<h6>{faq.AnswerParagraph}</h6>{/if}
        {#if faq.AnswerPage}<p>{faq.AnswerPage}</p>{/if}
        <Button icon={Edit} kind="ghost">EDIT</Button>
    </div>
</ExpandableTile>

{/each}