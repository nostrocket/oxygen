<script lang="ts">
  import { base } from "$app/paths";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { AccordionItem, Tag } from "carbon-components-svelte";

  export let rocket:Rocket|undefined = undefined

</script>
{#if rocket} 
<AccordionItem>
    <svelte:fragment slot="title">
      <h3 class="problem-title">{#if !rocket.Consensus}<Tag type="red">UNCONFIRMED</Tag>{/if}
        {rocket.Name}
      </h3>

      <div class="problem-summary">
        <Tag>{rocket.Problems.size} Problems</Tag>
      </div>
    </svelte:fragment>
        <p>
          <a href="{base}/problems/rocket/{rocket.Name}">View Open Problems</a><br />
          {#if rocket.ProblemID}<a href="{base}/problems/{rocket.ProblemID}">View the root problem for this Rocket</a>{:else}No Associated Problem{/if}
          <br />
        </p>
        <p>Created By: {rocket.CreatedBy}</p>
        <a href="{base}/rockets/{rocket.UID}">More...</a>
  </AccordionItem>
  {/if}