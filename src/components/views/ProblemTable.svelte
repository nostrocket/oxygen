<script>
  import { Problem } from "$lib/types";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import {
    DataTable,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    Pagination,
  } from "carbon-components-svelte";

  export let events = [{ id: 0, title: "sdf" }];

  $: render = events;

  // let rows = Array.from({ length: 10 }).map((_, i) => ({
  //   id: i,
  //   name: "Load Balancer " + (i + 1),
  //   protocol: "HTTP",
  //   port: 3000 + i * 10,
  //   rule: i % 2 ? "Round robin" : "DNS delegation",
  // }));
  let pageSize = 5;
  let page = 1;
  let filteredRowIds = [];

  $: console.log("filteredRowIds", filteredRowIds);
</script>

{#each render as e}
  {e.title}
{/each}
<DataTable
  headers={[{ key: "title", value: "Title" }]}
  rows={render}
  {pageSize}
  {page}
>
  <Toolbar>
    <ToolbarContent>
      <ToolbarSearch
        persistent
        value="round"
        shouldFilterRows
        bind:filteredRowIds
      />
    </ToolbarContent>
  </Toolbar>
</DataTable>

<Pagination
  bind:pageSize
  bind:page
  totalItems={filteredRowIds.length}
  pageSizeInputDisabled
/>
