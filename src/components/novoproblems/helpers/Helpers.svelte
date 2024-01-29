<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { derived } from "svelte/store";

  export let problem: Problem;
  export let hasOpenChildren = derived(consensusTipState, ($cts) => {
    let _problem = $cts.Problems.get(problem.UID);
    if (_problem) {
      for (let child of _problem.FullChildren) {
        if (child.Status != "closed") {
          return true;
        }
      }
      return false;
    }
  });
</script>
