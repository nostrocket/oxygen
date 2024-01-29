<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import { Fire } from "carbon-icons-svelte";
  import ClaimModal from "../modals/ClaimModal.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { UpdateStatus } from "$lib/helpers/publishProblem";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/problems";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";

  export let problem: Problem;
  let modalIsOpen = false;
</script>

{#if problem}
  {#if problem.Status == "open"}
    <ClaimModal
      bind:open={modalIsOpen}
      callback={() => {
        UpdateStatus(problem, "claimed")
          .then()
          .catch((error) => {
            console.error(error);
            //todo: add a global toast notification for errors
            //statusErrorText = error;
          });
      }}
    />
    <Button
    disabled={hasOpenChildren(problem, $consensusTipState)}
      icon={Fire}
      size="small"
      on:click={() => {
        modalIsOpen = true;
      }}
    >
      START WORKING NOW
    </Button>
  {/if}
{/if}
