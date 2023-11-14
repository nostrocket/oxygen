<script lang="ts">
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import type {
      Account,
      Problem,
      ProblemStatus,
    } from "$lib/stores/nostrocket_state/types";
    import {
      Accordion,
      Column,
      Row,
      Search,
      Select,
      SelectItem,
      SelectItemGroup,
    } from "carbon-components-svelte";
    import { derived, writable } from "svelte/store";
    import ProblemComponent from "../../components/problems/ProblemComponent.svelte";

    export let rocketID:string|undefined = undefined
  
    let rootNodes: Map<string, Problem>;
    let value: string;
    let selectedStatus: ProblemStatus = "all"
    if (rocketID) {
        selectedStatus = "open"
    }
  
    const queryInput = writable("");
    const problemStatus = writable<ProblemStatus | undefined>();
  
    const findNodeLevel = (nodeId: Account, level = 0): number => {
      const node = $FilteredProblemStore.get(nodeId);
  
      // Return default (if current node level is 1) or  previous level if we cannot find node
      if (!node) return level === 1 ? 0 : level - 1;
  
      // We are not checking for Title because we are already running this check in the filtered store
      if (!node.Parents) return level;
  
      const parentId = [...node.Parents][0];
      return findNodeLevel(parentId, level + 1);
    };
  
    export let FilteredProblemStore = derived(
      [consensusTipState, queryInput, problemStatus],
      ([$current, $queryInput, $problemStatus]) => {
        const filterQuery = $queryInput?.toLowerCase().replace(/\s+/g, "");
        let problemArray = [...$current.Problems];

        if (rocketID) {
            problemArray = problemArray.filter(([s, p]) =>{
                return (p.Rocket == rocketID)
            })
        }
  
        //apply filter from user input
        if (Boolean(filterQuery)) {
          problemArray = [...problemArray].filter(([_, node]) => {
            const filterText = `${node.Title}${node?.Summary}${node?.FullText}`
              .toLowerCase()
              .replace(/\s+/g, "");
            return filterText.includes(filterQuery);
          });
        }
        return new Map(
          problemArray.filter(([_, { Status }]) => {
            if (Boolean($problemStatus)) {
              if ($problemStatus != "all") {
                return Status === $problemStatus;
              } else {
                return true
              }
            } else {
              return true
            }
          })
        );
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
    ["all", "open", "claimed", "closed", "patched"].map((v) => [
      v,
      v as ProblemStatus,
    ])
  );
  </script>
  
  <Row>
    <Column md={4} lg={14}>
      <h2>Problem Tracker</h2>
    </Column>
  </Row>
  
  <Row padding>
    <Column lg={3}>
      <Select hideLabel size="xl" labelText="Status" bind:selected={selectedStatus} fullWidth>
        <SelectItem value={0} text={"Status"} hidden disabled />
        <SelectItemGroup label="Status">
          {#each problemStatuses as [key, value]}
            <SelectItem {value} text={key} />
          {/each}
        </SelectItemGroup>
      </Select>
    </Column>
    <Column>
      <Search placeholder="Filter..." bind:value />
    </Column>
  </Row>
  <Accordion>
    {#each rootNodes as [id, problem]}
      <ProblemComponent problemStore={FilteredProblemStore} {problem} depth={0} />
    {/each}
  </Accordion>
  