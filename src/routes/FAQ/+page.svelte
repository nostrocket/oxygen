<script lang="ts">
  import { Button, ExpandableTile, Tile } from "carbon-components-svelte";
  import { Add, Edit } from "carbon-icons-svelte";
  import LogNewFaq from "../../components/FAQ/LogNewFAQ.svelte";
  import { nostrocketIgnitionEvent } from "../../settings";
  import { derived } from "svelte/store";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { FAQ } from "$lib/stores/nostrocket_state/types";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  let logNew = false;
  let modify:FAQ | undefined = undefined;

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
{#if !logNew}<Button icon={Add} size="field" on:click={()=>{logNew=true; modify = undefined}}>ADD</Button>{/if}
{#if logNew}
<Tile light>
    {#if !modify}
  <h5>ADD A NEW FAQ</h5>
  <LogNewFaq bind:open={logNew} />
  {/if}
  {#if modify}
  <h5>MODIFY FAQ</h5>
  <LogNewFaq newFAQ={modify} bind:open={logNew} />
  {/if}
</Tile>
{/if}
{#if logNew && modify}
{/if}
{#if !logNew}
{#each $faqs as [id, faq]}
<ExpandableTile style="margin-top:1%">
    <div slot="above">
        <h4>{faq.Question}</h4>
        {#if faq.AnswerSentence}<p>{faq.AnswerSentence}</p>{/if}
    </div>
    <div slot="below">
        {#if faq.AnswerParagraph}<h6>{faq.AnswerParagraph}</h6>{/if}
        {#if faq.AnswerPage}<p>{faq.AnswerPage}</p>{/if}
        <Button on:click={()=>{
            logNew = true;
            modify = faq;
        }} icon={Edit} kind="ghost">EDIT</Button>
    </div>
</ExpandableTile>

{/each}
{/if}