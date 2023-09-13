<script>
  import ndk from "$lib/stores/ndk";
  import { rockets } from "$lib/state";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { Rocket } from "carbon-pictograms-svelte";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { AspectRatio, Column, Row, Tile } from "carbon-components-svelte";
</script>


<Row>
{#each $rockets as rocket}

<Column max={8}>
  <Tile style="margin:1px;">
     <!-- <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} /> -->
     <h3><Rocket />{rocket.Name}</h3>
     <p>Problem UID: {rocket.ProblemID}</p>
     <p>Rocket UID: {rocket.UID}</p>
     <a href="{base}/rockets/{rocket.UID}">More...</a>
    </Tile>
</Column>
{/each}
</Row>