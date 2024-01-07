<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type {
    Account,
    Problem,
    ProblemStatus,
    Rocket,
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
    Toggle,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import { derived, writable } from "svelte/store";
  import ProblemComponent from "../../components/problems/ProblemComponent.svelte";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";

  export let rocketID: string | undefined = undefined;
  export let actionableOnly: boolean = false;

  let rootNodes: Map<string, Problem>;
  let value: string;
  let selectedStatus: ProblemStatus;

  $: {
    $rocketIDSelected = rocketID;
  }
  $: {
    $problemStatus = selectedStatus;
  }

  const queryInput = writable("");
  const problemStatus = writable<ProblemStatus | undefined>();
  const rocketIDSelected = writable<string | undefined>();
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
    if (actionableOnly) {
      selectedStatus = "actionable";
    }
  });

  let problemArray = derived(consensusTipState, ($cts) => {
    return [...$cts.Problems];
  });

  let problemsFilteredByStatus = derived(
    [consensusTipState, problemStatus, problemArray],
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
      return $problemArray
    }
  );

  let filterQuery = derived(queryInput, ($queryInput) => {
    return $queryInput?.toLowerCase().replace(/\s+/g, "") 
  })

  let FilteredProblemStore = derived(
    [
      problemsFilteredByStatus,
      filterQuery,
      rocketIDSelected,
      onlyShowMyActivity,
    ],
    ([
      $problemsFilteredByStatus,
      $filterQuery,
      $rocketIDSelected,
      $onlyShowMyActivity,
    ]) => {

      if ($rocketIDSelected) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(([s, p]) => {
          return p.Rocket == $rocketIDSelected;
        });
      }

      if ($onlyShowMyActivity) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(([s, p]) => {
          return (
            p.CreatedBy == $currentUser?.pubkey ||
            p.ClaimedBy == $currentUser?.pubkey
          );
        });
      }

      //apply filter from user input
      if (Boolean(filterQuery)) {
        $problemsFilteredByStatus = $problemsFilteredByStatus.filter(([_, problem]) => {
          const filterText = `${problem.Title}${problem?.Summary}${problem?.FullText}`
            .toLowerCase()
            .replace(/\s+/g, "");
          return filterText.includes($filterQuery);
        });
      }
      return new Map($problemsFilteredByStatus);
    }
  );

  const handleQueryInput = (input) => ($queryInput = input);
  const handleStatusChange = (input) => ($problemStatus = input);

  $: {
    handleQueryInput(value);
  }

  $: {
    handleStatusChange(selectedStatus);
  }

  $: {
    // a node level of 0 is considered as root in the filtered list
    rootNodes = new Map(
      [...$FilteredProblemStore].filter(
        ([_, node]) => findNodeLevel(node.UID) === 0
      )
    );
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
{$FilteredProblemStore.size}
{#if $consensusTipState.Problems.size == 0}
  <Loading withOverlay description="Fetching Problems" />{/if}

<Row padding>
  <Column lg={2}>
    <Select
      hideLabel
      size="xl"
      labelText="Status"
      bind:selected={selectedStatus}
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
      bind:selected={rocketID}
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
    <Search placeholder="Filter..." bind:value />
  </Column>
</Row>
<Accordion>
  {#each rootNodes as [id, problem]}
    <ProblemComponent problemStore={FilteredProblemStore} {problem} />
  {/each}
</Accordion>
