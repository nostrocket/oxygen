<script lang="ts">
    import {CloseOutline, ConnectTarget, ContainerServices, Idea, Timer} from "carbon-icons-svelte";
    import ProblemStatus from "./ProblemStatus.svelte";

    export let status: string;

</script>

<div style="display: flex; align-items: center; text-transform: capitalize">
    {#if status === "openChildren"}
        <ProblemStatus status={'HAS OPEN CHILDREN'} color="blueviolet">
            <ContainerServices size={32}/>
        </ProblemStatus>
    {/if}

    {#if status === "open"}
        <ProblemStatus status={'OPEN AND CAN BE CLAIMED'} color="green">
            <Idea size={32}/>
        </ProblemStatus>
    {/if}

    {#if status === "claimed"}
        <ProblemStatus status={'CLAIMED AND IN PROGRESS'} color="orange">
            <Timer size={32}/>
        </ProblemStatus>
    {/if}

    {#if status === "patched"}
        <ProblemStatus status={'PATCHED AND WAITING FOR VALIDATION'} color="orange">
            <ConnectTarget size={32}/>
        </ProblemStatus>
    {/if}

    {#if status === "closed"}
        <ProblemStatus status={'CLOSED'} color="red">
            <CloseOutline size={32}/>
        </ProblemStatus>
    {/if}
</div>