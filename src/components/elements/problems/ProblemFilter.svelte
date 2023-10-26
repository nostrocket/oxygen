<script>
    import {getContext} from "svelte";
    import {Search, TextInput} from "carbon-components-svelte";

    let value
    const handleQueryInput = getContext('handleQueryInput')

    $: {
        handleQueryInput(value)
    }

</script>

<Search placeholder="Filter..." bind:value />