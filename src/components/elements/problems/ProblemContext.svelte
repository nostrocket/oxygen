<script>
    import {derived, writable} from "svelte/store";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import {setContext} from "svelte";

    const queryInput = writable('')
    const problems = derived([consensusTipState, queryInput], ([$current, $queryInput]) => {
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

    setContext('problems', problems)
    setContext('handleQueryInput', handleQueryInput)
</script>


<slot />