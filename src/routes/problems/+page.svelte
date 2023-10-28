<script lang="ts">
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {Accordion, Column, Row, Search} from "carbon-components-svelte";
    import {derived, writable} from "svelte/store";
    import AddProblem from "../../components/problems/AddProblemModal.svelte";
    import ProblemComponent from "../../components/problems/ProblemComponent.svelte";
    import type {Account, Problem} from "$lib/stores/nostrocket_state/types";

    let rootNodes: Map<string, Problem>
    const queryInput = writable('')

    const findNodeLevel = (nodeId: Account, level = 0): number => {
        const node = $FilteredProblemStore.get(nodeId)

        // Return default (if current node level is 1) or  previous level if we cannot find node
        if (!node) return (level === 1 ? 0 : level - 1);

        // We are not checking for Title because we are already running this check in the filtered store
        if (!node.Parents && node.Head) return level

        const parentId = [...node.Parents][0];
        return findNodeLevel(parentId, level + 1)
    }

    export let FilteredProblemStore = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
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
        return new Map(problemArray.filter(([_, {Title}]) => Boolean(Title)))
    })

    const handleQueryInput = (input) => $queryInput = input
    let value

    $: {
        handleQueryInput(value)
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
    <Column>
        <AddProblem/>
    </Column>
</Row>

<Row padding>
    <Column>
        <Search placeholder="Filter..." bind:value/>
        <p>[!DEBUG] {$FilteredProblemStore.size} problems from `FilteredProblemStore` SHOULD be rendered below.</p>
    </Column>
</Row>

<Accordion>
    {#each rootNodes as [id, problem]}
        <ProblemComponent problemStore={FilteredProblemStore} {problem} depth={0}/>
    {/each}
</Accordion>

