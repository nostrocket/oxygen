<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived } from "svelte/store";
  import RocketHome from "../../../../components/views/RocketHome.svelte";

  let rocketName = derived(page, ($p) => {
    return $p.params.rocket;
  });

  let rocket = derived(
    [rocketName, consensusTipState],
    ([$rocketName, $cts]) => {
      for (let [_, r] of $cts.RocketMap) {
        if (r.Name.toLowerCase() == $rocketName.toLowerCase()) {
          return $cts.RocketMap.get(r.UID);
        }
      }
      return undefined;
    }
  );

</script>

<RocketHome
  rocketName={$rocketName}
  rocket={$rocket}
  selectedTab={$page.params.tab}
  id={undefined}
/>
