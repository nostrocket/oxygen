<script lang="ts">
    import {Column, Row, TextInput} from "carbon-components-svelte";
    import AddProblem from "../../components/modals/AddProblem.svelte";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {derived, writable, type Readable} from "svelte/store";
    import ProblemList from "../../components/elements/problems/ProblemList.svelte";
    import type { Problem } from "$lib/stores/nostrocket_state/types";
   
    let problems: Readable<Map<string, Problem>>;
    let queryInput = writable<string>('')
    let bypass = false //used for debugging why problems are not be rendered

    $: {
        console.log("ConsensusTipState.Problems.size", $consensusTipState.Problems.size)
    }

    $: {
        problems = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
            if (bypass) {
                return $current.Problems
            } else {
                const filterQuery = $queryInput.toLowerCase()
                let problemArray = [...($current.Problems)]

                //remove any problems that don't have a title yet
                problemArray = problemArray.filter(([id, p])=>{
                  return p.Title 
                })

                //apply filter from user input
                if (Boolean(filterQuery)) {
                   problemArray = [...problemArray].filter(([_, {Title, Summary, FullText}]) => {
                   const filterText = `${Title} ${Summary} ${FullText}`.toLowerCase()
                   return filterText.includes(filterQuery)
                   })
                }
                return new Map(problemArray.filter(([_, {Title}]) => Boolean(Title)))
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
Number of problems that SHOULD be rendered: {$problems.size}
<ProblemList problems={problems} depth={0}/>

