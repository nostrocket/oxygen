<script>
  import { Tabs, Tab, TabContent } from "carbon-components-svelte";
  import Identity from "../../components/views/Identity.svelte";
</script>

<Tabs>
  <Tab label="Participants" />
  <Tab label="Maintainers" />
  <svelte:fragment slot="content">
    <TabContent><Identity type="participants" /></TabContent>
    <TabContent><Identity type="maintainers" /></TabContent>
  </svelte:fragment>
</Tabs>


