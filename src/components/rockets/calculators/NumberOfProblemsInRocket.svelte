<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { derived } from "svelte/store";

  export let rocket: Rocket;

  function problems(r:Rocket) {
    let p = new Set<string>();
    for (let [id, _problem] of $consensusTipState.Problems) {
      if (_problem.Rocket == rocket.UID) {
        p.add(id);
      }
    }
    if (rocket.Problems) {
      if (rocket.Problems.size < p.size) {
        rocket.Problems = p;
      }
    }
    return p;
  }
  
</script>

{problems(rocket).size}
