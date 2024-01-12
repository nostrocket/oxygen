<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived, writable } from "svelte/store";

  import RecursiveProblem from "../../components/problems/RecursiveProblem.svelte";

  import { rootProblem } from "../../settings";
  import {
    Column,
    Loading,
    Row,
    Search,
    Select,
    SelectItem,
    SelectItemGroup,
    Tile,
  } from "carbon-components-svelte";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";

  const problemStatuses = [
    "everything",
    "actionable",
    "in-progress",
    "patched",
    "closed",
  ];

  let focus:string;

  let filter = writable({
    rocketID:
      "691d02aa05108c31c6f9b25555da937383dd2dce7df2f8ebc64f9ae751c12c0f",
    fulltext: undefined,
    problemStatus: "open", //todo make array of allowed statuses based on filter input
    displayStatus: undefined,
    noOpenChildren: false,
  });

  filter.subscribe((f) => {
    f.displayStatus = f.problemStatus;
    switch (f.problemStatus) {
      case "actionable":
        f.displayStatus = "open";
        break;
      case "everything":
        f.displayStatus = undefined;
        break;
      case "in-progress":
        f.displayStatus = "claimed";
        break;
    }
    return f;
  });

  let filtered = derived([filter, consensusTipState], ([$filter, $cts]) => {
    for (let [_, p] of $cts.Problems) {
      p.RenderData.grey = false;
      p.RenderData.hidden = false;
      if ($filter.displayStatus) {
        if (p.Status != $filter.displayStatus) {
          p.RenderData.grey = true;
          p.RenderData.hidden = true;
        }
      }
      if ($filter.rocketID) {
        if (p.Rocket != $filter.rocketID) {
          p.RenderData.grey = true;
          p.RenderData.hidden = true;
        }
      }
      //todo: if this !hidden, recursive all parents and make them not hidden
    }
    return $cts.Problems;
  });

  let unhidden = derived([filtered, consensusTipState], ([$filtered, $cts]) => {
    for (let i = 0; i < 50; i++) {
      //todo: don't use hardcoded loop number
      for (let [_, p] of $cts.Problems) {
        if (!p.RenderData.hidden) {
          for (let parentID of p.Parents) {
            let parent = $cts.Problems.get(parentID);
            if (parent) {
              parent.RenderData.hidden = false;
            }
          }
        }
      }
    }

    return $cts.Problems;
  });

  let problem = derived(unhidden, ($unhidden) => {
    return $consensusTipState.Problems.get(rootProblem);
  });

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

{#if $consensusTipState.Problems.size == 0}
  <Loading withOverlay description="Fetching Problems" />{/if}
<Row>
  <Column>
    <Tile>
      <Row>
        <Column lg={3}>
          <Select
            hideLabel
            size="sm"
            labelText="Status"
            bind:selected={$filter.problemStatus}
          >
            <SelectItem value={0} text={"Status"} hidden disabled />
            <SelectItemGroup label="Status">
              {#each problemStatuses as status}
                <SelectItem value={status} text={status} />
              {/each}
            </SelectItemGroup>
          </Select>
        </Column>
        <Column lg={3}>
          <Select
            hideLabel
            size="sm"
            labelText="Status"
            bind:selected={$filter.rocketID}
          >
            <SelectItem value={undefined} text={"ALL ROCKETS"} />
            {#each [...$rocketNames.values()] as rocket}
              <SelectItem value={rocket.UID} text={rocket.Name} />
            {/each}
          </Select>
        </Column>
        <Column>
          <Search
            size="sm"
            placeholder="Filter..."
            bind:value={$filter.fulltext}
          />
        </Column>
      </Row>
    </Tile>
  </Column>
</Row>
<Row>
  <Column>
    {#if $problem}<RecursiveProblem problem={$problem} bind:focus={focus}/>{/if}
  </Column>
</Row>
