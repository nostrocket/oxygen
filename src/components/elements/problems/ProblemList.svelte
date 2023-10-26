<script lang="ts">
    import {Accordion} from "carbon-components-svelte";
    import {type Readable} from "svelte/store";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import ProblemComponent from "../Problem.svelte";
    import {getContext} from "svelte";

    export let depth

    const problemList: Readable<Map<string, Problem>> = getContext('problems')
</script>

<Accordion>
    {#each $problemList as [id, problem]}
        {#if (!problem.Parents && problem.Head && problem.Title)}
            <ProblemComponent {problem} depth={0}/>
        {/if}
    {/each}
</Accordion>

<br/><br/>


<style>
    /* give a solid background so we don't see other elements behind this one when zooming in on it. */
    :global(.bx--accordion__heading, .bx--accordion__content) {
        background-color: #161616;
    }

    :global(.problem .bx--accordion__content) {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    :glolbal(.problem, .problem div) {
        background-color: #161616;
    }

    :global(.problem .problem *) {
        transition: all 250ms ease-in-out;
        transform-style: preserve-3d;
        perspective: 1000px;
        will-change: transform;
    }

    :global(.problem > button) {
        border-left: var(--depthColor) 4px solid;
        border-bottom: transparent 0px solid;
    }

    /* when a problem is clicked, it becomes focused */
    :global(.focus-problem) {
        box-shadow: 0 0 50px #000, 0 0 50px #000; /*, 0 0 50px #000, 0 0 50px #000;*/
        transition: all 250ms ease-in-out;
        margin: 2rem 0;
    }

    :global(.focus-problem > button) {
        border-left: transparent 0px solid;
        border-bottom: var(--depthColor) 4px solid;
        transition: all 250ms ease-in-out;
        transform: perspective(1000px) translateZ(50px);
        position: relative;
        z-index: 999;
    }

    /* prevent white outline box when focused */
    :global(.problem .bx--accordion__heading:focus::before) {
        border: none;
    }
</style>