<script lang="ts">
    import {Accordion} from "carbon-components-svelte";
    import {derived} from "svelte/store";
    import ProblemItem from "./ProblemItem.svelte";

    export let problems
    export let depth

    const fetchRootKeys = (tree) => {
        let childKeys = [];

        ([...tree]).forEach(([_, node]) => {
            if (node.Children) {
                childKeys = [...childKeys, ...node.Children]
            }
        })

        return [...tree.keys()].filter((key) => childKeys.indexOf(key) === -1)
    }

    const fetchDescendantKeys = (children) => {
        let nodeKeys = []
        children.forEach((child) => {
            const node = $problems.get(child)
            nodeKeys = node?.Children ? [...nodeKeys, ...fetchDescendantKeys(node.Children)] : [...nodeKeys, ...[child]]
        })

        return nodeKeys
    }

    const fetchChildNodes = (childKeys, problem) => {
        const descendantKeys = fetchDescendantKeys(childKeys)
        return derived(problems, ($problems) => {
            return new Map([...$problems].filter(([key, _]) => {
                return descendantKeys.indexOf(key) !== -1
            }))
        })
    }

    const rootNodes = derived(problems, ($problems) => {
        return new Map([...$problems].filter(([key, _]) => {
            return fetchRootKeys($problems).indexOf(key) !== -1
        }))
    })
</script>

<Accordion>
    {#each $rootNodes as [id, problem]}
        <ProblemItem problem={problem} depth={depth}/>
        {#if problem.Children}
            <svelte:self problems={fetchChildNodes(problem.Children)} depth={depth + 1}/>
        {/if}
    {/each}
</Accordion>

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