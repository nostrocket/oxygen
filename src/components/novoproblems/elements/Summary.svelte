<script lang="ts">
  import { copyString } from "$lib/helpers/mundane";
  import { Problem } from "$lib/stores/nostrocket_state/types";

  import {
    Button,
    ButtonSet,
    InlineNotification,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { Edit } from "carbon-icons-svelte";
  export let problem: Problem;
  let existingSummary = "";
  export let currentUserCanModify = false;
  let edit = false;
  export let publish: () => void;
</script>

{#if !edit}
  <Tile style="border:solid;border-width:thin;"
    ><h6>
      TLDR: {problem.Summary ?? problem.Title}{#if currentUserCanModify}<Button
          iconDescription="edit"
          on:click={() => {
            if (!problem.Summary) {
              problem.Summary = copyString(problem.Title)
            }
            existingSummary = copyString(problem.Summary);
            edit = true;
          }}
          kind="ghost"
          size="small"
          icon={Edit}
        />{/if}
    </h6></Tile
  >
{/if}

{#if edit}<TextInput bind:value={problem.Summary} /><ButtonSet
    ><Button
      on:click={() => {
        problem.Summary = existingSummary;
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
  >{/if}
