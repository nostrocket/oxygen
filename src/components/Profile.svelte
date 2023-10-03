<script>
  import { FUCKYOUVITE } from "$lib/stores/state";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { AspectRatio, Column, Row, Tile } from "carbon-components-svelte";
  export let profile = FUCKYOUVITE() // can't use ts in svelte components because vite is being a dick
  export let ndk;
  export let num = 0;
</script>

<Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
    <Row>
    <Tile style="width:100%; height:100%; margin:1px;">
      <Row>
      <Column>
        <AspectRatio ratio="1x1" style="width:100%;">
            <img src={profile.profile?.image} width="100%" height="100%" alt="[profile pic here]">
            <!-- <Avatar ndk={$ndk} user={profile}/> -->
      </AspectRatio>
      </Column>
      <Column> <p>{profile.profile?.name}</p>#{num}</Column>
      </Row>
    </Tile>
  </Row>
</Column>