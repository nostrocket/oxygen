<script lang="ts">
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import { Accordion, Column, Row, Search } from "carbon-components-svelte";
    import { derived, writable } from "svelte/store";
    import AddProblem from "../../components/problems/AddProblemModal.svelte";
  import ProblemComponent from "../../components/problems/ProblemComponent.svelte";

  const queryInput = writable('')
    export let FilteredProblemStore = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
        const filterQuery = $queryInput?.toLowerCase().replace(/\s+/g, '')
        let problemArray = [...($current.Problems)]

        //apply filter from user input
        if (Boolean(filterQuery)) {
            problemArray = [...problemArray].filter(([_, {Title, Summary, FullText}]) => {
                const filterText = `${Title}`.toLowerCase().replace(/\s+/g, '')
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
            <Search placeholder="Filter..." bind:value />
            <p>[!DEBUG] {$FilteredProblemStore.size} problems from `FilteredProblemStore` SHOULD be rendered below.</p>
        </Column>
    </Row>
    <Accordion>
        {#each $FilteredProblemStore as [id, problem]}
            {#if (!problem.Parents && problem.Head && problem.Title)}
                <ProblemComponent problemStore={FilteredProblemStore} {problem} depth={0}/>
            {/if}
        {/each}
    </Accordion>

