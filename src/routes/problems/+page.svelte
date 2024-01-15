<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Loading } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import ChatLayout from "../../components/problems/ChatLayout.svelte";
  import { rootProblem } from "../../settings";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  let problem = derived([consensusTipState], ([$cts]) => {
    return $cts.Problems.get(rootProblem);
  });
  onMount(() => {
    if ($problem) {
      goto(`${base}/problems/${$problem.UID}`);
    }
  });
</script>

<Loading />
