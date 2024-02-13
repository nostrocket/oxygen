<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived } from "svelte/store";
  import RocketHome from "../../../../../components/views/RocketHome.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  let rocketName = derived(page, ($p) => {
    return $p.params.rocket;
  });

  let rocket = derived(
    [rocketName, consensusTipState],
    ([$rocketName, $cts]) => {
      if ($rocketName) {
        for (let [_, r] of $cts.RocketMap) {
          if (r.Name.toLowerCase() == $rocketName.toLowerCase()) {
            return $cts.RocketMap.get(r.UID);
          }
        }
      }
      return undefined;
    }
  );

  let selectedtab = derived(page, ($p) => {
    return $p.params.tab;
  });

  let id = derived(page, ($p) => {
    return $p.params.id;
  });

  let problem = derived(
    [selectedtab, id, consensusTipState],
    ([$selectedtab, $id, $cts]) => {
      if ($selectedtab == "problems" && $id && $cts) {
        return $cts.Problems.get($id);
      }
    }
  );

  let incorrectRocket = derived([problem, rocket], ([$problem, $rocket]) => {
    if ($rocket && $problem) {
      return $problem.Rocket !== $rocket.UID;
    }
    return false;
  });

  incorrectRocket.subscribe((v) => {
    if (v && $problem && $selectedtab == "problems") {
      let r = $consensusTipState.RocketMap.get($problem.Rocket);
      if (r) {
        goto(`${base}/nr/${r.Name}/problems/${$problem.UID}`);
      }
    }
  });

  // $: {
  //   if (rocket && id) {
  //     let p = problem(rocket, id);
  //     if (p) {
  //       if (p.Rocket !== rocket.UID) {
  //         let problemRocket = $consensusTipState.RocketMap.get(p.Rocket);
  //         if (problemRocket) {
  //           goto(`${base}/nr/${problemRocket.Name}/${id}`);
  //         }
  //       }
  //     }
  //   }
  // }
</script>

<RocketHome
  rocketName={$rocketName}
  rocket={$rocket}
  selectedTab={$selectedtab}
  id={$id}
/>
