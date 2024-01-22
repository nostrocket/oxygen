<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    InlineLoading,
    InlineNotification,
    Loading,
    Row,
    Tab,
    Tabs,
  } from "carbon-components-svelte";
  import { derived, type Readable } from "svelte/store";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import ProblemView from "../novoproblems/ProblemView.svelte";
  import ProfileSmall from "../elements/ProfileSmall.svelte";
  import RocketDisplay from "../rockets/RocketDisplay.svelte";
  import MeritsView from "./MeritsView.svelte";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";

  export let rocketName: string;

  // let rocketName = derived(page, ($p) => {
  //   return $p.params.rocket;
  // });

  export let rocket: Rocket;

  export let selectedTab: string;


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

  export let id: string | undefined = undefined;

  function problem(rocket: Rocket, problemID?: string) {
    if (rocket) {
      if (problemID) {
        return $consensusTipState.Problems.get(problemID);
      } else {
        return $consensusTipState.Problems.get(rocket.ProblemID);
      }
    }
    return null;
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

  function selectedTabIndex(name: string) {
    switch (name) {
      case "info":
        return 0;
      // case "people":
      //   return 1;
      case "problems":
        return 1;
      case "discussion":
        return 2;
      case "merits":
        return 3;
      case "products":
        return 4;
    }
  }
</script>

{#if rocket}
  <Row>
    <h2>ROCKET: {rocket.Name.toUpperCase()}</h2>
    <Tabs selected={selectedTabIndex(selectedTab)} autoWidth>
      <Tab label="Overview"
        on:click={() => {
          goto(`${base}/${rocket.Name}/info`);
        }}>Overview</Tab
      >
      <!-- <Tab
        on:click={() => {
          goto(`${base}/${rocket.Name}/people`);
        }}>People</Tab
      > -->
      <Tab label="Problems"
        on:click={() => {
          goto(`${base}/${rocket.Name}/problems`);
        }}>Problems</Tab
      >
      <Tab label = "Discussion"
        on:click={() => {
          goto(`${base}/${rocket.Name}/discussion`);
        }}>Discussion</Tab
      >
      <Tab label="Merits"
        on:click={() => {
          goto(`${base}/${rocket.Name}/merits`);
        }}>Merits</Tab
      >
      <Tab label="Products"
        on:click={() => {
          goto(`${base}/${rocket.Name}/products`);
        }}
        tabindex="5">Products</Tab
      >
    </Tabs>
  </Row>

  {#if selectedTab == "info"}
    <RocketDisplay {rocket} problem={problem(rocket)} />
  {/if}

  {#if selectedTab == "_"}
    <ProfileSmall pubkey={rocket.CreatedBy} />
  {/if}

  {#if selectedTab == "problems"}
    {#if problem(rocket, id)}<ProblemView problem={problem(rocket, id)} />
    {:else}<InlineNotification
        kind="info"
        lowContrast
        title="NOTICE"
        subtitle="No problems have been found for {rocket.Name}, but this could mean we are still searching for them on relays"
        ><InlineLoading /></InlineNotification
      >{/if}
  {/if}

  {#if selectedTab == "discussion"}
    <CommentsWrapper parentId={rocket.UID} isRoot />
  {/if}

  {#if selectedTab == "merits"}
    <MeritsView {rocket} />
  {/if}
{:else}<Loading />
{/if}
{#if selectedTab == "products"}<InlineNotification
kind="info"
lowContrast
title="NOTICE"
subtitle="No {rocket.Name} products have been found, but this could mean we are still searching for them on relays"
><InlineLoading /></InlineNotification
>{/if}
<!-- {#if $rocket && $problem}<ProblemView  problem={$problem}/>{:else}<Loading />{/if} -->
