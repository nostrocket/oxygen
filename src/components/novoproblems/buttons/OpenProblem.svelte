<script lang="ts">
    import { Button } from "carbon-components-svelte";
    import { Fire, Restart, Send } from "carbon-icons-svelte";
    import ClaimModal from "../modals/ClaimModal.svelte";
    import type { Problem } from "$lib/stores/nostrocket_state/types";
    import { UpdateStatus } from "$lib/helpers/publishProblem";
    import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/problems";
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import ReOpenModal from "../modals/ReOpenModal.svelte";
  
    export let problem: Problem;
    export let currentUserCanModify = false;
    let modalIsOpen = false;
  </script>
  
  {#if problem && currentUserCanModify}
    {#if problem.Status == "closed"}
      <ReOpenModal
        bind:open={modalIsOpen}
        callback={() => {
          UpdateStatus(problem, "open")
            .then()
            .catch((error) => {
              console.error(error);
              //todo: add a global toast notification for errors
              //statusErrorText = error;
            });
        }}
      />
      <Button
      kind="tertiary"
        icon={Restart}
        size="small"
        on:click={() => {
          modalIsOpen = true;
        }}
      >
        RE-OPEN THIS PROBLEM
      </Button>
    {/if}
  {/if}
  