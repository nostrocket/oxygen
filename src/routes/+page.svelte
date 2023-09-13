<script>
  import { identitiesInTree } from "$lib/state";
  import ndk from "$lib/stores/ndk";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { Button, truncate, breakpoints, Tile, Row, Column, Grid } from "carbon-components-svelte";
  import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
  import { AspectRatio } from "carbon-components-svelte";

</script>


<h2>These people have joined Nostrocket</h2>
<Row>
  <Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
    <!-- <AspectRatio ratio="2x1" style="height:100%;"> -->
      <Row>
      <Tile light style="width:100%; height:100%; margin:1px;">
        <Row>
        <Column>
          <AspectRatio ratio="1x1" style="width:100%;">
            todo: get user image from profile if we have pubkey, or use silhouette if none.
          <!-- <Avatar ndk={$ndk} pubkey={ident.Account}/> -->
        </AspectRatio>
        </Column>
        <Column> <Button icon={User}>REQUEST</Button>
          <p>#{$identitiesInTree.length}</p>
         </Column>
         
        </Row>
      </Tile>
    </Row>
    <!-- </AspectRatio> -->
  </Column>
  {#each $identitiesInTree as ident}
  <Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
    <!-- <AspectRatio ratio="2x1" style="height:100%;"> -->
      <Row>
      <Tile style="width:100%; height:100%; margin:1px;">
        <Row>
        <Column>
          <AspectRatio ratio="1x1" style="width:100%;">
          <Avatar ndk={$ndk} pubkey={ident.Account}/>
        </AspectRatio>
        </Column>
        <Column> <p>{ident.Name}</p>#{ident.Order}</Column>
        </Row>
      </Tile>
    </Row>
    <!-- </AspectRatio> -->
  </Column>
  {/each}
</Row>