<script lang="ts">
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
    } from "carbon-components-svelte";
    import { derived, writable } from "svelte/store";
    import ProblemComponent from "../../components/problems/ProblemComponent.svelte";

    export let rocketID:string|undefined = undefined
  
    let rootNodes: Map<string, Problem>;
    let value: string;
    let selectedStatus: ProblemStatus;

    $: {
      // if ($problemStatus = "all") {
      //   rocketID = undefined
      // }
      // if (!rocketID) {
      //   selectedStatus = "all"
      // }
    //   if (rocketID) {
    //     selectedStatus = "actionable"
    // }
    console.log(rocketID)
    console.log(selectedStatus)
    }

    $:{$rocketIDSelected = rocketID}
    $:{$problemStatus = selectedStatus}
  
    const queryInput = writable("");
    const problemStatus = writable<ProblemStatus | undefined>();
    const rocketIDSelected = writable<string | undefined>();
  
    const findNodeLevel = (nodeId: Account, level = 0): number => {
      const node = $FilteredProblemStore.get(nodeId);
  
      // Return default (if current node level is 1) or  previous level if we cannot find node
      if (!node) return level === 1 ? 0 : level - 1;
  
      // We are not checking for Title because we are already running this check in the filtered store
      if (!node.Parents) return level;
  
      const parentId = [...node.Parents][0];
      return findNodeLevel(parentId, level + 1);
    };
  
   let FilteredProblemStore = derived(
      [consensusTipState, queryInput, problemStatus, rocketIDSelected],
      ([$current, $queryInput, $problemStatus, $rocketIDSelected]) => {
        const filterQuery = $queryInput?.toLowerCase().replace(/\s+/g, "");
        let problemArray = [...$current.Problems];

        if ($rocketIDSelected) {
            problemArray = problemArray.filter(([s, p]) =>{
                return (p.Rocket == $rocketIDSelected)
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
          problemArray = problemArray.filter(([_, { Status, Children }]) => {
            if (Boolean($problemStatus)) {
              if ($problemStatus == "all") {
                return true
              } else if ($problemStatus == "actionable") {
                if (Status == "open") {
                  if (Children.size == 0) {return true}
                  if (Children.size > 0) {
                    for (let child of Children) {
                      if ($consensusTipState.Problems.get(child)?.Status != "closed") {
                        return false
                      }
                    }
                    return true
                  }
                }
              } else {
                return Status === $problemStatus;
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
    ["actionable", "all", "open", "claimed", "closed", "patched"].map((v) => [
      v,
      v as ProblemStatus,
    ])
  );

  const rocketNames = derived(consensusTipState, ($consensusTipState)=>{
    let rockets = new Map<string, Rocket>();
    for (let [id, rocket] of $consensusTipState.RocketMap) {
      rockets.set(id, rocket)
    }
    return rockets
  })
  </script>
  
  <Row>
    <Column md={4} lg={14}>
      <h2>Problem Tracker</h2>
    </Column>
  </Row>

  {#if $consensusTipState.Problems.size == 0} <Loading withOverlay description="Fetching Problems" />{/if}
  
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
    <Column lg={3}>
      <Select hideLabel size="xl" labelText="Status" bind:selected={rocketID} fullWidth>
        <SelectItem value={0} text={"Rocket"} hidden disabled />
        <SelectItemGroup label="Rocket">
          {#each [...$rocketNames.values()] as rocket}
            <SelectItem value={rocket.UID} text={rocket.Name} />
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
  