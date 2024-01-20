<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Loading, Row, Tab, Tabs } from "carbon-components-svelte";
  import { derived, type Readable } from "svelte/store";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import ProblemView from "../novoproblems/ProblemView.svelte";
  import ProfileSmall from "../novoproblems/ProfileSmall.svelte";
  import RocketDisplay from "../rockets/RocketDisplay.svelte";
  import MeritsView from "./MeritsView.svelte";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";

  export let rocketName:string;

  // let rocketName = derived(page, ($p) => {
  //   return $p.params.rocket;
  // });

  export let rocket:Rocket;

  export let selectedTab:string; 

  // let rocket = derived(
  //   [rocketName, consensusTipState],
  //   ([$rocketName, $cts]) => {
  //     for (let [_, r] of $cts.RocketMap) {
  //       if (r.Name.toLowerCase() == $rocketName.toLowerCase()) {
  //         return $cts.RocketMap.get(r.UID);
  //       }
  //     }
  //     return undefined;
  //   }
  // );

export let id:string | undefined = undefined;



function problem(rocket:Rocket, problemID?:string) {
  if (rocket) {
    if (problemID) {
  return $consensusTipState.Problems.get(problemID);
} else {
  return $consensusTipState.Problems.get(rocket.ProblemID);
}
  }
  return null
}

  // $:problem = derived(
  //   [consensusTipState],
  //   ([$cts]) => {
  //     if (rocket && selectedTab == "problems") {
  //       if (id) {
  //         return $cts.Problems.get(id);
  //       } else {
  //         return $cts.Problems.get(rocket.ProblemID);
  //       }
  //     }
  //     return null;
  //   }
  // );

  // let selectedTabIndex = derived(page, ($page) => {
  //   switch ($page.params.tab) {
  //     case "info":
  //       return 0;
  //     case "people":
  //       return 1;
  //     case "problems":
  //       return 2;
  //     case "discussion":
  //       return 3;
  //     case "merits":
  //       return 4;
  //     case "products":
  //       return 5;
  //   }
  // });

  function selectedTabIndex(name:string) {
    switch (name) {
      case "info":
        return 0;
      case "people":
        return 1;
      case "problems":
        return 2;
      case "discussion":
        return 3;
      case "merits":
        return 4;
      case "products":
        return 5;
    }
  }
</script>

{#if rocket && problem(rocket, id)}
  <Row>
    <h2>ROCKET: {rocket.Name.toUpperCase()}</h2>
    <Tabs selected={selectedTabIndex(selectedTab)} autoWidth>
      <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/info`);
        }}>Info</Tab
      >
      <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/people`);
        }}>People</Tab
      >
      <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/problems`);
        }}>Problems</Tab
      >
      <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/discussion`);
        }}>Discussion</Tab
      >
      <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/merits`);
        }}>Merits</Tab
      >
      <Tab>Products</Tab>
    </Tabs>
  </Row>

  {#if selectedTabIndex(selectedTab) == 0}
    <RocketDisplay rocket={rocket} problem={problem(rocket)} />
  {/if}

  {#if selectedTabIndex(selectedTab) == 1}
    <ProfileSmall pubkey={rocket.CreatedBy} />
  {/if}

  {#if selectedTabIndex(selectedTab) == 2}
    {#if problem(rocket, id)}<ProblemView problem={problem(rocket, id)} />{:else}<Loading />{/if}
  {/if}

  {#if selectedTabIndex(selectedTab) == 3}
    <CommentsWrapper parentId={rocket.UID} isRoot />
  {/if}

  {#if selectedTabIndex(selectedTab) == 4}
    <MeritsView rocket={rocket} />
  {/if}
{:else}<Loading />
{/if}
<!-- {#if $rocket && $problem}<ProblemView  problem={$problem}/>{:else}<Loading />{/if} -->
