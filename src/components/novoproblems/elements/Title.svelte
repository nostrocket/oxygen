<script lang="ts">
  import { copyString } from "$lib/helpers/mundane";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button, ButtonSet, TextInput } from "carbon-components-svelte";
  import { Edit } from "carbon-icons-svelte";

  export let problem: Problem;
  export let currentUserCanModify = false;
  export let publish:() => void;
  let existingTitle: string;
  let edit = false;
</script>

{#if !edit}{problem.Title}{#if currentUserCanModify}<Button
    on:click={() => {
      existingTitle = copyString(problem.Title);
      edit = true;
    }}
    size="small"
    kind="ghost"
    iconDescription="edit"
    icon={Edit}
  />{/if}{/if}
{#if edit}<TextInput bind:value={problem.Title} /><ButtonSet
    ><Button
      on:click={() => {
        problem.Title = existingTitle;
        edit = false;
      }}
      kind="secondary"
      size="field">CANCEL</Button
    ><Button on:click={()=>{edit = false; publish()}} size="field">PUBLISH</Button></ButtonSet
  >{/if}
