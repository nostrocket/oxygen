<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Loading,
    Tab,
    TabContent,
    Tabs,
    UnorderedList
  } from "carbon-components-svelte";
  import { derived, writable } from "svelte/store";
  import ChatLayout from "../../../components/problems/ChatLayout.svelte";
  import RecursiveList from "../../../components/problems/RecursiveList.svelte";
  import { rootProblem } from "../../../settings";
  import { HorizontalView, TreeViewAlt } from "carbon-icons-svelte";

  let problem = derived([page, consensusTipState], ([$page, $cts]) => {
    return $cts.Problems.get($page.params.id);
  });

  let selected = writable(0)

  page.subscribe(p=>{
    selected.update(s=>{
      s = 0
      return s
    })
  })

</script>

<Tabs bind:selected={$selected}>
  <Tab><HorizontalView /> STACK VIEW</Tab>
  <Tab><TreeViewAlt /> TREE VIEW</Tab>
  <svelte:fragment slot="content">
    <TabContent>
      {#if $problem}
        <ChatLayout selected={$problem} />
      {:else}
        <Loading />
      {/if}
    </TabContent>
    <TabContent>
      <UnorderedList>
        {#if $problem}<RecursiveList problem={$consensusTipState.Problems.get(rootProblem)} />{:else}
          <Loading />
        {/if}
      </UnorderedList>
    </TabContent>
  </svelte:fragment>
</Tabs>
