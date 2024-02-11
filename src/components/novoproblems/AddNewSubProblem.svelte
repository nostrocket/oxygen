<script lang="ts">
  import { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    Column,
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { Send, SettingsEdit } from "carbon-icons-svelte";
  import ChildProblemTile from "./elements/ChildProblemTile.svelte";

  export let problem: Problem;
  export let publish: (pr:Problem) => void;
  export let value:string = "";
  export let required = false;

  $:{value = newProblem.Title}

  let newProblem: Problem = new Problem();
</script>

<TextInput light
    invalid={required && value.length == 0}
      helperText={newProblem.Title.length > 0
        ? "Describe the problem you face or have observed"
        : ""}
      maxlength={100}
      placeholder="Start typing to add a new problem here..."
      bind:value={newProblem.Title}
    />
{#if newProblem.Title.length > 0}
  <Row>
    <Column><ChildProblemTile preview problem={newProblem} /></Column>
  </Row>
  <Row>
    <Column
      ><Tile light
        ><ButtonSet
          ><Button kind="tertiary" icon={SettingsEdit} size="small"
            >ADD MORE DETAILS</Button
          ><Button on:click={()=>{newProblem.Parents.add(problem.UID);publish(newProblem)}} icon={Send} size="small">PUBLISH</Button></ButtonSet
        ></Tile
      ></Column
    >
  </Row>
{/if}
