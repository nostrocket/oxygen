<script lang="ts">
  import { makeHtml } from "$lib/helpers/mundane";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Row, Column } from "carbon-components-svelte";

  export let problem: Problem;
</script>

<Row padding>
  <Column>
    {#if problem.FullText.length == 0}<h5>
        There's no description for this problem yet! Want to <a href="#"
          >add it now</a
        >?
      </h5>{/if}
    {@html makeHtml(problem?.FullText)}</Column
  >
</Row>
