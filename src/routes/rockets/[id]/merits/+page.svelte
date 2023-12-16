<script lang="ts">
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Accordion, Button, Tile } from "carbon-components-svelte";
  import { derived, get } from "svelte/store";
  import CommentUser from "../../../../components/comments/CommentUser.svelte";
  import ProblemComponent from "../../../../components/problems/ProblemComponent.svelte";

  let rocket = derived([page, consensusTipState], ([$page, $consensusTipState]) =>{
    return $consensusTipState.RocketMap.get($page.params.id)
  })
</script>
{#if $rocket}
{#each $rocket.Merits as [id, merit]}
<Tile>
    <p>
    Requested By: <CommentUser pubkey={merit.CreatedBy} />
    <br />
    Amount (sats): {merit.Amount}
    <br />
    Problem:
    <Accordion><ProblemComponent dontShowExtraChildren problemID={merit.Problem}/></Accordion>
    <Button on:click={()=>{
        console.log(merit)
    }}>PRINT FULL OBJECT TO CONSOLE</Button>
</p>
</Tile>
{/each}
{/if}