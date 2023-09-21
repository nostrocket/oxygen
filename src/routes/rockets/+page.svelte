<script>
  import ndk from "$lib/stores/ndk";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { Rocket } from "carbon-pictograms-svelte";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { AspectRatio, Column, Row, Tile } from "carbon-components-svelte";
  import CreateRocket from "../../components/modals/CreateRocket.svelte";
  import { consensusTipState, rocketMap } from "$lib/stores/state";
</script>


<Row>
  <Column sm={8}>
  <CreateRocket />
</Column>
</Row>
<Row>
{#each [...$rocketMap] as [key, rocket]}

<Column max={8}>
  <Tile style="margin:1px;">
     <!-- <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} /> -->
     <h3><Rocket />{rocket.Name}</h3>
     <p>Problem UID: {rocket.ProblemID}</p>
     <p>Rocket UID: {key}</p>
     <a href="{base}/rockets/{rocket.UID}">More...</a>
    </Tile>
</Column>
{/each}

{#each [...$consensusTipState.RocketMap] as [key, rocket]}

<Column max={8}>
  <Tile style="margin:1px;">
     <!-- <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} /> -->
     <h3><Rocket />{rocket.Name}</h3>
     <p>Problem UID: {rocket.ProblemID}</p>
     <p>Rocket UID: {key}</p>
     <a href="{base}/rockets/{rocket.UID}">More...</a>
    </Tile>
</Column>
{/each}
</Row>