<script lang="ts">
    import {Column, Row, TextInput} from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {derived, writable} from "svelte/store";
    import ProblemList from "../../components/problems/ProblemList.svelte";
    //problem: cannot filter the problem tracker by content etc
    //problem: problems without titles are still being rendered becasue the ProblemComponent is pulling them from consensusTipState and our filtering is currently done in this if statement.
    //solutoin to both of these problems: create a new derived store here and pass it to the ProblemComponent so that we can filter based on user input. See https://github.com/pablof7z/vendata.io/ for examples

    const queryInput = writable<string>('')
    const problems = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
        const filterQuery = $queryInput.toLowerCase()
        let problemArray = [...($current.Problems)]

        if (Boolean(filterQuery)) {
            problemArray = [...problemArray].filter(([_, {Title, Summary, FullText}]) => {
                const filterText = `${Title} ${Summary} ${FullText}`.toLowerCase()
                return filterText.includes(filterQuery)
            })
        }

        return new Map(problemArray.filter(([_, {Title}]) => Boolean(Title)))
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


<ProblemList problems={problems} depth={0}/>

