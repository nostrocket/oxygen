<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Loading, Row, Tab, Tabs } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import RocketViewer from "../../../components/views/RocketViewer.svelte";
  import ProblemView from "../../../components/novoproblems/ProblemView.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import RocketDisplay from "../../../components/rockets/RocketDisplay.svelte";
  import Profile from "../../../components/elements/Profile.svelte";
  import ProfileSmall from "../../../components/novoproblems/ProfileSmall.svelte";
  import CommentsWrapper from "../../../components/comments/CommentsWrapper.svelte";
  import MeritsView from "../../../components/views/MeritsView.svelte";

  $: {
    console.log($page.params);
  }
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

  let problem = derived([rocket, consensusTipState], ([$rocket, $cts]) => {
    if ($rocket) {
      return $cts.Problems.get($rocket.ProblemID);
    }
    return null;
  });

  let selectedTabIndex = derived(page, ($page) => {
    switch ($page.params.tab) {
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
  });

  // $: {console.log()}
</script>


{#if $rocket && $problem}
<Row>
  <h2>ROCKET: {$rocket.Name.toUpperCase()}</h2>
  <Tabs selected={$selectedTabIndex} autoWidth>
    <Tab on:click={()=>{
      goto(`${base}/${$page.params.rocket}/info`)
    }}>Info</Tab>
    <Tab on:click={()=>{
      goto(`${base}/${$page.params.rocket}/people`)
    }}>People</Tab>
    <Tab on:click={()=>{
      goto(`${base}/${$page.params.rocket}/problems`)
    }}>Problems</Tab>
    <Tab on:click={()=>{
      goto(`${base}/${$page.params.rocket}/discussion`)
    }}>Discussion</Tab>
    <Tab on:click={()=>{
      goto(`${base}/${$page.params.rocket}/merits`)
    }}>Merits</Tab>
    <Tab>Products</Tab>
  </Tabs>
</Row>

{#if $selectedTabIndex == 0}
<RocketDisplay rocket={$rocket} problem={$problem} />
{/if}

{#if $selectedTabIndex == 1}
<ProfileSmall pubkey={$rocket.CreatedBy} />
{/if}

{#if $selectedTabIndex == 2}
{#if $problem}<ProblemView  problem={$problem}/>{:else}<Loading />{/if}
{/if}

{#if $selectedTabIndex == 3}
<CommentsWrapper parentId={$rocket.UID} isRoot />
{/if}

{#if $selectedTabIndex == 4}
<MeritsView rocket={$rocket}/>
{/if}

{:else}<Loading />
{/if}
<!-- {#if $rocket && $problem}<ProblemView  problem={$problem}/>{:else}<Loading />{/if} -->
