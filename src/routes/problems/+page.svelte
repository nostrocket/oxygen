<script lang="ts">
    import { problemStatuses } from "$lib/constants";
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import type { Account, Problem, ProblemStatus } from "$lib/stores/nostrocket_state/types";
    import { Accordion, Column, Row, Search, Select, SelectItem, SelectItemGroup } from "carbon-components-svelte";
    import { derived, writable } from "svelte/store";
    import LogNewProblemModal from "../../components/problems/LogNewProblemModal.svelte";
    import ProblemComponent from "../../components/problems/ProblemComponent.svelte";

    let rootNodes: Map<string, Problem>
    let value: string;
    let selected: ProblemStatus;

    const queryInput = writable('')
    const problemStatus = writable<ProblemStatus | undefined>()

    const findNodeLevel = (nodeId: Account, level = 0): number => {
        const node = $FilteredProblemStore.get(nodeId)

        // Return default (if current node level is 1) or  previous level if we cannot find node
        if (!node) return (level === 1 ? 0 : level - 1);

        // We are not checking for Title because we are already running this check in the filtered store
        if (!node.Parents) return level

        const parentId = [...node.Parents][0];
        return findNodeLevel(parentId, level + 1)
    }

    export let FilteredProblemStore = derived([consensusTipState, queryInput, problemStatus], ([$current, $queryInput, $problemStatus]) => {
        const filterQuery = $queryInput?.toLowerCase().replace(/\s+/g, '')
        let problemArray = [...($current.Problems)]

        //apply filter from user input
        if (Boolean(filterQuery)) {
            problemArray = [...problemArray].filter(([_, node]) => {
                const filterText = `${node.Title}${node?.Summary}${node?.FullText}`.toLowerCase().replace(/\s+/g, '')
                return filterText.includes(filterQuery)
            })
        }

        //remove any problems that don't have a title yet and return
        return new Map(problemArray.filter(([_, {Title, Status}]) => {
            if (Boolean($problemStatus)) {
                return Boolean(Title) && Status === $problemStatus
            }

            return Boolean(Title)
        }))
    })

    const handleQueryInput = (input) => $queryInput = input
    const handleStatusChange = (input) => $problemStatus = input

    $: {
        handleQueryInput(value)
    }

    $: {
        handleStatusChange(selected)
    }

    $: {
        // a node level of 0 is considered as root in the filtered list
        rootNodes = new Map([...$FilteredProblemStore].filter(([_, node]) => findNodeLevel(node.UID) === 0))
    }

</script>

<Row>
    <Column md={4} lg={14}>
        <h2>Problem Tracker</h2>
    </Column>
</Row>

<Row padding>
    <Column lg={3}>
        <Select hideLabel size="xl" labelText="Status" bind:selected fullWidth>
            <SelectItem value={0} text={'Status'} hidden disabled/>
            <SelectItemGroup label="Status">
                {#each problemStatuses as [key, value]}
                    <SelectItem value={value} text={key}/>
                {/each}
            </SelectItemGroup>
        </Select>
    </Column>
    <Column>
        <Search placeholder="Filter..." bind:value/>
    </Column>
</Row>
<Accordion>
    {#each rootNodes as [id, problem]}
        <ProblemComponent problemStore={FilteredProblemStore} {problem} depth={0}/>
    {/each}
</Accordion>

