<script>
    import ndk from "$lib/stores/ndk";
    import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
    import { Rocket } from "carbon-pictograms-svelte";
    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import { AspectRatio, Column, Row, Tile } from "carbon-components-svelte";
    import CreateRocket from "../../components/modals/CreateRocket.svelte";
    import { consensusTipState, mempool, rocketMap } from "$lib/stores/state";
  import { kindToText } from "$lib/kinds";
  </script>
  

<h1>Events in Mempool</h1>
<Row>
  {#each [...$mempool] as [key, event]}
  
  <Column max={4}>
    <Tile style="margin:1px;">
       <!-- <Avatar ndk={$ndk} pubkey={rocket.CreatedBy} /> -->
       <h6><Rocket />{event.id}</h6>
       <p>Kind: {event.kind}</p>
       <a href="{base}/eventviewer/{event.id}">More...</a>
      </Tile>
  </Column>
  {/each}
  </Row>