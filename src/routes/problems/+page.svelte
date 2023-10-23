<script lang="ts">
    import {Accordion, Column, Row, TextInput} from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
    import ProblemComponent from "../../components/elements/Problem.svelte";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {derived, writable} from "svelte/store";
    //problem: cannot filter the problem tracker by content etc
    //problem: problems without titles are still being rendered becasue the ProblemComponent is pulling them from consensusTipState and our filtering is currently done in this if statement.
    //solutoin to both of these problems: create a new derived store here and pass it to the ProblemComponent so that we can filter based on user input. See https://github.com/pablof7z/vendata.io/ for examples

    const queryInput = writable<string>('')
    const problems = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
        const filterQuery = $queryInput.toLowerCase()
        const problemArray = [...($current.Problems)]

        return new Map(problemArray.filter(([_, {Title, Summary, FullText}]) => {
            const filterText = `${Title} ${Summary} ${FullText}`.toLowerCase()
            return Boolean(Title) && filterText.indexOf(filterQuery) !== -1
        }))
    })

    const handleQueryInput = (event) => $queryInput = event.detail
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
        <TextInput placeholder="Search..."
                   bind:value={$queryInput}
                   on:input={handleQueryInput}
        />
    </Column>
</Row>


<Accordion>
    {#each $problems as [id, problem]}
        {#if (!problem.Parents && problem.Head && problem.Title)}
            <ProblemComponent {problem} depth={0}/>
        {/if}
    {/each}
</Accordion>

