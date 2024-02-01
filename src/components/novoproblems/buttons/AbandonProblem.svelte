<script lang="ts">
  import { UpdateStatus } from "$lib/helpers/publishProblem";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button } from "carbon-components-svelte";
  import { Send } from "carbon-icons-svelte";

  export let problem: Problem;
</script>

{#if problem}
  {#if problem.Status == "claimed"}
    <Button
      on:click={() => {
        UpdateStatus(problem, "open")
          .then()
          .catch((error) => {
            console.error(error);
            //todo: add a global toast notification for errors
            //statusErrorText = error;
          });
      }}
      kind="ghost"
      icon={Send}
      size="small"
    >
      ABANDON THIS PROBLEM
    </Button>
  {/if}
{/if}
