<script lang="ts">
  import { makeHtml } from "$lib/helpers/mundane";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Row, Column } from "carbon-components-svelte";

  export let problem: Problem;
</script>

<Row padding>
  <Column>{@html makeHtml(problem?.FullText)}</Column>
</Row>
