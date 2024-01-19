<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import { base } from "$service-worker";
  import { Tabs, Tab, Row } from "carbon-components-svelte";
  import { derived } from "svelte/store";

  export let rocket: Rocket;



  // let selectedTab = derived(page, ($page) => {
  //   return $page.url.searchParams.get("maintab") ?? "info";
  // });

  // let selectedTabIndex = derived(selectedTab, ($selectedTab) => {
  //   switch ($selectedTab) {
  //     case "info":
  //       return 0;
  //     case "people":
  //       return 1;
  //     case "problems":
  //       return 2;
  //     case "discussion":
  //       return 3;
  //     case "merits":
  //       return 4;
  //     case "products":
  //       return 5;
  //   }
  // });
</script>

<!-- <Row>
  <h2>ROCKET: {rocket.Name.toUpperCase()}</h2>
  <Tabs selected={0} autoWidth>
    <Tab >Info</Tab>
    <Tab>People</Tab>
    <Tab>Problems</Tab>
    <Tab>Discussion</Tab>
    <Tab>Merits</Tab>
    <Tab>Products</Tab>
  </Tabs>
</Row> -->
