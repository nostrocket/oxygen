<script>
  import { FUCKYOUVITE } from "$lib/stores/state";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import { AspectRatio, Column, Row, Tile } from "carbon-components-svelte";
  export let profile = FUCKYOUVITE() // can't use ts in svelte components because vite is being a dick
  export let num = 0;
</script>

<Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
    <Row style="height:99%;padding:2px;">
    <Tile style="width:100%; height:100%;overflow:hidden;">
        <Row>
            <Column>
             <AspectRatio ratio="1x1" style="width:100%;">
            <Tile light>
            <div style="text-align:center;overflow:hidden;"><h6>{profile.profile?.name}</h6></div>
            <div style="margin:2%;"><img src={profile.profile?.image} width="100%" height="auto" alt="[profile pic here]"></div>
            <!-- <Avatar ndk={$ndk} user={profile}/> -->
            </Tile>
        </AspectRatio>
      </Column>
      <Column> 
       <AspectRatio ratio="1x1">
        <div style="overflow:hidden;height:96%"><code>{profile.profile?.about}</code></div>
        <div style="float:right;"><h6>#{num}</h6></div>
        </AspectRatio>
    </Column>
        </Row>
    </Tile>
  </Row>
</Column>