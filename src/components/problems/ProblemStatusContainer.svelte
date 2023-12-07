<script lang="ts">
    import {CloseOutline, ConnectTarget, ContainerServices, Idea, Timer} from "carbon-icons-svelte";
    import ProblemStatus from "./ProblemStatus.svelte";
  import Countdown from "../elements/Countdown.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Column, Row } from "carbon-components-svelte";

    export let status: string;
    export let problem:Problem;

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
    <Column><Row><ProblemStatus status={'CLAIMED AND IN PROGRESS'} color="orange"><Timer /></ProblemStatus></Row><Row><Countdown endUnix={(problem.ClaimedAt + 259200) * 1000} /></Row></Column>
    <Row><Column>    </Column></Row>
          
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