<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button } from "carbon-components-svelte";
  import { DataEnrichmentAdd } from "carbon-icons-svelte";
  export let parent: Problem|undefined;
  export let existing:boolean = false
</script>

<Button
size="small"
kind="primary"
icon={DataEnrichmentAdd}
on:click={() => {
    if (!existing){goto(`${base}/problems/new/${parent?.UID}`)}
    if (existing) {goto(`${base}/problems/edit/${parent?.UID}`)}
    }}
>
{#if parent?.UID.length === 64}Log a New Problem Under This One{:else if existing}Edit This Problem{/if}
</Button>