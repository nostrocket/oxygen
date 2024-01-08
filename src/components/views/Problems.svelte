<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    Problem,
    type Account,
    type ProblemStatus,
    type Rocket,
  } from "$lib/stores/nostrocket_state/types";
  import {
    Accordion,
    Column,
    Loading,
    Row,
    Search,
    Select,
    SelectItem,
    SelectItemGroup,
    Tag,
    Toggle,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import { derived, writable } from "svelte/store";
  import ProblemComponent from "../../components/problems/ProblemComponent.svelte";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import { rootProblem } from "../../settings";

  export let rocketID: string | undefined = undefined;
  export let actionableOnly: boolean = false;

  const fulltextFilterInput = writable("");
  const problemStatusInput = writable<ProblemStatus | undefined>();
  const rocketIDInput = writable<string | undefined>();
  const onlyShowMyActivity = writable<boolean>(false);

  const findNodeLevel = (nodeId: Account, level = 0): number => {
    const node = $FilteredProblemStore.get(nodeId);

    // Return default (if current node level is 1) or  previous level if we cannot find node
    if (!node) return level === 1 ? 0 : level - 1;

    // We are not checking for Title because we are already running this check in the filtered store
    if (!node.Parents) return level;

    const parentId = [...node.Parents][0];
    return findNodeLevel(parentId, level + 1);
  };

  onMount(() => {
    problemStatusInput.update((s) => {
      if (actionableOnly) {
        return "actionable";
      } else {
        return "all";
      }
    });
  });

  let problemArray = derived(consensusTipState, ($cts) => {
    return [...$cts.Problems];
  });

  let problemsFilteredByStatus = derived(
    [consensusTipState, problemStatusInput, problemArray],
    ([$current, $problemStatus, $problemArray]) => {
      if ($problemStatus != "all") {
        if ($problemStatus == "actionable") {
          $problemArray = $problemArray.filter(([s, p]) => {
            return p.Status == "open";
          });
          $problemArray = $problemArray.filter(([s, p]) => {
            return !hasOpenChildren(p, $current);
          });
        }
        if ($problemStatus != "actionable") {
          $problemArray = $problemArray.filter(([s, p]) => {
            return p.Status == $problemStatus;
          });
        }
      }
      return $problemArray;
    }
  );

  let filterQuery = derived(fulltextFilterInput, ($fulltextFilterInput) => {
    return $fulltextFilterInput?.toLowerCase().replace(/\s+/g, "");
  });

  let FilteredProblemStore = derived(
    [problemsFilteredByStatus, filterQuery, rocketIDInput, onlyShowMyActivity],
    ([
      $problemsFilteredByStatus,
      $filterQuery,
      $rocketIDSelected,
      $onlyShowMyActivity,
    ]) => {
      if ($rocketIDSelected) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(
          ([s, p]) => {
            return p.Rocket == $rocketIDSelected;
          }
        );
      }

      if ($onlyShowMyActivity) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(
          ([s, p]) => {
            return (
              p.CreatedBy == $currentUser?.pubkey ||
              p.ClaimedBy == $currentUser?.pubkey
            );
          }
        );
      }

      //apply filter from user input
      if (Boolean(filterQuery)) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(
          ([_, problem]) => {
            const filterText =
              `${problem.Title}${problem?.Summary}${problem?.FullText}`
                .toLowerCase()
                .replace(/\s+/g, "");
            return filterText.includes($filterQuery);
          }
        );
      }
      return new Map($problemsFilteredByStatus);
    }
  );

  let rootNodes = derived(FilteredProblemStore, ($FilteredProblemStore) => {
    return [...$FilteredProblemStore].filter(([_, problem]) => {
      return findNodeLevel(problem.UID) == 0;
    });
  });

  let fullProblemTree = derived(consensusTipState, ($consensusTipState) => {
    let Tree = $consensusTipState.Problems.get(rootProblem);
    if (Tree) {
      return recurivePopulateTree(Tree);
    }
    return new Problem()
  });

  fullProblemTree.subscribe(x=>{
    console.log(x)
  })

  function recurivePopulateTree(root: Problem) {
    for (let child of root.Children) {
      let c = $consensusTipState.Problems.get(child);
      if (c) {
        root.FullChildren.add(c);
      }
    }
    for (let child of root.FullChildren) {
      child = recurivePopulateTree(child)
    }
    return root
  }

  const problemStatuses: Map<string, ProblemStatus> = new Map(
    ["actionable", "all", "open", "claimed", "closed", "patched"].map((v) => [
      v,
      v as ProblemStatus,
    ])
  );

  const rocketNames = derived(consensusTipState, ($consensusTipState) => {
    let rockets = new Map<string, Rocket>();
    for (let [id, rocket] of $consensusTipState.RocketMap) {
      if (rocket.Problems.size > 0) {
        rockets.set(id, rocket);
      }
    }
    return rockets;
  });
</script>

<Row>
  <Column md={4} lg={14}>
    <h2>Problem Tracker</h2>
  </Column>
</Row>

{#if $consensusTipState.Problems.size == 0}
  <Loading withOverlay description="Fetching Problems" />{/if}

<Row padding>
  <Column lg={2}>
    <Select
      hideLabel
      size="xl"
      labelText="Status"
      bind:selected={$problemStatusInput}
      fullWidth
    >
      <SelectItem value={0} text={"Status"} hidden disabled />
      <SelectItemGroup label="Status">
        {#each problemStatuses as [key, value]}
          <SelectItem {value} text={key} />
        {/each}
      </SelectItemGroup>
    </Select>
  </Column>
  <Column lg={2}>
    <Select
      hideLabel
      size="xl"
      labelText="Status"
      bind:selected={$rocketIDInput}
      fullWidth
    >
      <SelectItem value={undefined} text={"ALL ROCKETS"} />
      {#each [...$rocketNames.values()] as rocket}
        <SelectItem value={rocket.UID} text={rocket.Name} />
      {/each}
    </Select>
  </Column>
  {#if $currentUser}
    <Column lg={2}>
      <Toggle
        labelA="Everyone"
        labelB="Mine Only"
        bind:toggled={$onlyShowMyActivity}
      />
    </Column>
  {/if}
  <Column>
    <Search placeholder="Filter..." bind:value={$fulltextFilterInput} />
  </Column>
</Row>
<Tag>Before Filter: {$problemArray.length}</Tag><Tag type="teal"
  >After Filter: {$FilteredProblemStore.size}</Tag
><Tag
  interactive
  on:click={() => {
    console.log($rootNodes);
  }}
  type="teal">Root Nodes: {$rootNodes.length}</Tag
>
<Accordion>
  {#each $rootNodes as [id, problem]}
    <ProblemComponent
      problemStore={FilteredProblemStore}
      problemID={problem.UID}
    />
  {/each}
</Accordion>
//todo: populate a derived store with all problems starting with root problem and
children (as sub objects). Render using svelte:self https://stackoverflow.com/questions/74166756/how-can-i-render-a-component-in-its-own-component-recursively-in-svelte
If parent is filtered out, render it as greyed out use difference between current
state and filtered state to decide what should be rendered and what should be greyed
out
