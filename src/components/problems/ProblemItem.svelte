<script>
    import {AccordionItem, InlineLoading} from "carbon-components-svelte";
    import AddProblem from "../modals/AddProblem.svelte";
    import {getDepthColor} from "$lib/helpers/ProblemDepthColor";

    export let problem
    export let depth;

    let openState;

    $: depthColor = getDepthColor(depth);
    $: focusProblem = openState ? "problem focus-problem" : "problem";
    $: if (openState) {
        console.log(problem)
    }
</script>

<AccordionItem
        class={focusProblem}
        style="margin-left:{depth}%;--depthColor:{depthColor};"
        bind:open={openState}
>
    <svelte:fragment slot="title">
        <h2 class="problem-title">{problem.Title}</h2>

        {#if problem.Summary}
            <div class="problem-summary">{problem.Summary}</div>
        {/if}
    </svelte:fragment>

    <AddProblem parent={problem.UID}/>
</AccordionItem>


<style>
    /* problem styles */
    .problem-title {
        font-size: 16px;
        font-weight: 300;
        margin: 0;
    }
    .problem-summary {
        opacity: 0.5;
        font-size: 14px;
        font-weight: 200;
        margin: 0;
    }

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