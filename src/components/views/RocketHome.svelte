<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import NDKSvelte, {
    type ExtendedBaseType,
    type NDKEventStore,
  } from "@nostr-dev-kit/ndk-svelte";
  import {
    InlineLoading,
    InlineNotification,
    Loading,
    Row,
    Tab,
    Tabs,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import { derived, writable, type Readable } from "svelte/store";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import ProfileSmall from "../elements/ProfileSmall.svelte";
  import ProblemView from "../novoproblems/ProblemView.svelte";
  import RocketDisplay from "../rockets/RocketDisplay.svelte";
  import NumberOfProblemsInRocket from "../rockets/calculators/NumberOfProblemsInRocket.svelte";
  import MeritsView from "./MeritsView.svelte";

  export let rocketName: string;
  export let rocket: Rocket;

  export let selectedTab: string;
  export let id: string | undefined = undefined;

  function problem(rocket: Rocket, problemID?: string) {
    if (!rocket) {
      throw new Error("no rocket");
    }
    if (problemID) {
      return $consensusTipState.Problems.get(problemID);
    } else {
      return $consensusTipState.Problems.get(rocket.ProblemID);
    }
  }



  function selectedTabIndex(name: string) {
    switch (name) {
      case "info":
        return 0;
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

  const _search: NDKSvelte = new NDKSvelte({
    explicitRelayUrls: ["wss://search.nos.today"],
  });

  let s = writable(_search);
  let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>>;
  let searchResultsToRender: Readable<
    ExtendedBaseType<ExtendedBaseType<NDKEvent>>[]
  >;
  let initted = false;
  $: {
    if (rocket) {
      if (rocket.Name && !initted) {
        initted = true;
        _search.connect().then(() => {
          console.log("search relay connected");
          searchResults = $s.storeSubscribe<NDKEvent>(
            { kinds: [1], search: rocket.Name },
            { closeOnEose: true }
          );
          searchResultsToRender = derived(searchResults, ($results) => {
            let r = $results.filter((x) => {
              return x.content.length < 1000;
            });
            return r;
          });
        });
      }
    }
  }
</script>

{#if rocket}
  <Row>
    <h2>ROCKET: {rocket.Name.toUpperCase()}</h2>
    <Tabs selected={selectedTabIndex(selectedTab)} autoWidth>
      <Tab
        label="Overview"
        on:click={() => {
          goto(`${base}/nr/${rocket.Name}/info`);
        }}>Overview</Tab
      >
      <Tab
      label="Merit Requests"
      on:click={() => {
        goto(`${base}/nr/${rocket.Name}/merits`);
      }}>Merit Requests <Tag size="sm">{rocket.Merits.size}</Tag></Tab
    >
      <Tab
      label="Equity and Cashflow"
      on:click={() => {
        goto(`${base}/nr/${rocket.Name}/merits`);
      }}>Equity and Cashflow <Tag size="sm">{rocket.Merits.size}</Tag></Tab
    >
      <Tab
        label="Problems []"
        on:click={() => {
          goto(`${base}/nr/${rocket.Name}/problems`);
        }}
        >Problems <Tag size="sm"><NumberOfProblemsInRocket {rocket} /></Tag
        ></Tab
      >
      <Tab
        label="Discussion"
        on:click={() => {
          goto(`${base}/nr/${rocket.Name}/discussion`);
        }}>Discussion <Tag size="sm">{$searchResultsToRender?.length}</Tag></Tab
      >

      <Tab
        label="Products"
        on:click={() => {
          goto(`${base}/nr/${rocket.Name}/products`);
        }}
        tabindex="5">Products</Tab
      >
      <Tab
      label="Actions"
      on:click={() => {
        goto(`${base}/nr/${rocket.Name}/actions`);
      }}
      tabindex="6">Actions</Tab
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
        subtitle="Waiting for events, this sometimes takes a while."
        ><InlineLoading /></InlineNotification
      >{/if}
  {/if}

  {#if selectedTab == "discussion"}
    <CommentsWrapper parentId={rocket.UID} isRoot />
    {#if $searchResults}
      {#each [...$searchResultsToRender] as e}
        <Tile style="margin:2px;"
          ><p><ProfileSmall pubkey={e.pubkey} /></p>
          <p>{e.content}</p>
          <a href={`https://primal.net/e/${e.id}`}>primal</a></Tile
        >
      {/each}{/if}
  {/if}

  {#if selectedTab == "merits"}
    <MeritsView {rocket} />
  {/if}

  {#if selectedTab == "actions"}
  
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
