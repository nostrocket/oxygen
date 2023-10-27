<script lang="ts">
    import {Accordion} from "carbon-components-svelte";
      import type { Readable } from "svelte/store";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import ProblemComponent from "./ProblemComponent.svelte";
    import {getContext} from "svelte";

    const problemList: Readable<Map<string, Problem>> = getContext('problems_y789n45t')
</script>

<Accordion>
    {#each $problemList as [id, problem]}
        {#if (!problem.Parents && problem.Head && problem.Title)}
            <ProblemComponent {problem} depth={0}/>
        {/if}
    {/each}
</Accordion>

<br/><br/>

