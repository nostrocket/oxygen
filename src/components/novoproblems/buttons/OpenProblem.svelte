<script lang="ts">
    import { UpdateStatus } from "$lib/helpers/publishProblem";
    import type { Problem } from "$lib/stores/nostrocket_state/types";
    import { Button } from "carbon-components-svelte";
    import { Restart } from "carbon-icons-svelte";
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
            .then(()=>{problem.Status = "open"})
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
  