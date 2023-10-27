<script>
    import { Search } from "carbon-components-svelte";
    import { getContext } from "svelte";

    let value
    const handleQueryInput = getContext('handleQueryInput_j8f5')

    $: {
        handleQueryInput(value)
    }

</script>

<Search placeholder="Filter..." bind:value />