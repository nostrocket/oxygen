<script lang="ts">
  import { makeHtml } from "$lib/helpers/mundane";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button, ButtonSet, Column, Row, TextArea } from "carbon-components-svelte";
  import { Edit } from "carbon-icons-svelte";

  export let problem: Problem;
  let existing = "";
  export let currentUserCanModify = false;
  let edit = false;
  export let publish: () => void;

  let onclick = () => {
                existing = problem.FullText;
                edit = true;
              }
</script>

<Row padding>
  <Column noGutter>
    {#if !edit}
      {#if problem.FullText.length == 0}<h5>
          There's no description for this problem yet!
        </h5>
        {#if currentUserCanModify}
          <h5>
            Want to <a
              on:click={onclick}
              href="#">add it now</a
            >?
          </h5>{/if}{/if}
      {@html makeHtml(problem?.FullText)}
      <Button on:click={onclick} style="float:right" kind="ghost" icon={Edit}>EDIT</Button>
    {/if}
    {#if edit}
      <Row>
        <Column lg={8}
          ><TextArea rows={problem.FullText.split(/\r\n|\r|\n/).length} bind:value={problem.FullText} /><ButtonSet
          ><Button
            on:click={() => {
              problem.FullText = existing;
              edit = false;
            }}
            kind="secondary"
            size="field">CANCEL</Button
          ><Button
            on:click={() => {
              edit = false;
              publish();
            }}
            size="field">PUBLISH</Button
          ></ButtonSet
        ></Column
        >
        <Column lg={8}>{@html makeHtml(problem.FullText)}</Column>
      </Row>
    {/if}
  </Column>
</Row>
