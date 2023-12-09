<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { rootProblem } from "../../settings";

function recursiveDepth(head:Problem, currentDepth:number):number {
    head.Depth = currentDepth
    for (let childID of head.Children) {
      let child = $consensusTipState.Problems.get(childID)
      if (child) {
        
        recursiveDepth(child, currentDepth+1)
      }
    }
    return currentDepth
  }

  let totalDepth = 0

  $: {
    let head = $consensusTipState.Problems.get(rootProblem)
    if (head) {
      totalDepth = recursiveDepth(head, 0)
    }
  }

</script>

<div style="display: none;">{totalDepth}</div>