<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Loading
  } from "carbon-components-svelte";
  import { derived, writable } from "svelte/store";
  import ProblemView from "../../../components/novoproblems/ProblemView.svelte";

  let problem = derived([page, consensusTipState], ([$page, $cts]) => {
    return $cts.Problems.get($page.params.id);
  });

  let selected = writable(0);

  page.subscribe((p) => {
    let selectedTab = 0;
    let viewMode = p.url.searchParams.get("view");
    switch (viewMode) {
      case "focus":
        selectedTab = 0;
        break;
      case "stack":
        selectedTab = 1;
        break;
      case "tree":
        selectedTab = 2;
        break;
    }
    selected.update((s) => {
      s = selectedTab;
      return s;
    });
  });
</script>

{#if $problem}
<ProblemView problem={$problem} />
{:else}
  <Loading />
{/if}
