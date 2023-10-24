<script lang="ts">
    import {Column, Row, TextInput} from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {derived, writable, type Readable} from "svelte/store";
    import ProblemList from "../../components/elements/problems/ProblemList.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
    //problem: cannot filter the problem tracker by content etc
    //problem: problems without titles are still being rendered becasue the ProblemComponent is pulling them from consensusTipState and our filtering is currently done in this if statement.
    //solutoin to both of these problems: create a new derived store here and pass it to the ProblemComponent so that we can filter based on user input. See https://github.com/pablof7z/vendata.io/ for examples

    let problems: Readable<Map<string, Problem>>;
    let queryInput = writable<string>('')

    $: {
        problems = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
        const filterQuery = $queryInput.toLowerCase()
        let problemArray = [...($current.Problems)]

        if (Boolean(filterQuery)) {
            console.log(21)
            problemArray = [...problemArray].filter(([_, {Title, Summary, FullText}]) => {
                const filterText = `${Title} ${Summary} ${FullText}`.toLowerCase()
                return filterText.includes(filterQuery)
            })
        }

        return new Map(problemArray.filter(([_, {Title}]) => Boolean(Title)))
    })
    }

    $: {
        consensusTipState.subscribe(cts=>{
            if (cts.Problems.has("321e1ead277a2782f00460d7a0d811de4a866fd16ddc8f4d1df79e9eda78c7c2")) {
                console.log("problem 24 Oct found. Is it rendered?")
            }
        })
    }
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
        <TextInput placeholder="Filter..."
                   bind:value={$queryInput}
                   on:input={handleQueryInput}
        />
    </Column>
</Row>


<ProblemList problems={problems} depth={0}/>

