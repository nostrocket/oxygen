<script lang="ts">
  import type { FAQ } from "$lib/stores/nostrocket_state/types";
  import { Button, Tile } from "carbon-components-svelte";
  import { ChevronDown, ChevronUp, Edit } from "carbon-icons-svelte";
  import LogNewFaq from "./LogNewFAQ.svelte";
  import { makeHtml } from "$lib/helpers/mundane";
  export let expanded = true;
  export let faq: FAQ | undefined = undefined;

  let modify = false;
</script>

{#if faq}
  {#if modify}
    <h5>MODIFY FAQ</h5>
    <LogNewFaq bind:open={modify} bind:newFAQ={faq} />
    <hr />
  {/if}
  <Tile
    ><div
      style="cursor: pointer;"
      on:click={() => {
        if (!modify) {
          expanded = !expanded;
        }
      }}
    >
      {#if !expanded}<div style="float:right;">
          <ChevronDown />
        </div>{/if}
      <h4>{faq.Question}</h4>
      {#if faq.AnswerSentence}<p>{faq.AnswerSentence}</p>
        <br />{/if}
    </div>
    {#if expanded}
      {#if faq.AnswerParagraph}<p style="font-style: italic;">
          {faq.AnswerParagraph}
        </p>
        <br />{/if}
      {#if faq.AnswerPage}<p>{@html makeHtml(faq.AnswerPage)}</p>{/if}
      <Button
        on:click={() => {
          modify = true;
          expanded = true;
        }}
        icon={Edit}
        kind="ghost">EDIT</Button
      >
      {#if !modify}
        <div
          on:click={() => {
            if (!modify) {
              expanded = !expanded;
            }
          }}
          style="float:right;cursor: pointer;"
        >
          <ChevronUp />
        </div>
      {/if}
    {/if}
  </Tile>
{/if}
