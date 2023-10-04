<script>
  import ndk from "$lib/stores/ndk";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
  import {
    Button,
    truncate,
    breakpoints,
    Tile,
    Row,
    Column,
    Grid,
    ExpandableTile,
    InlineNotification,
  } from "carbon-components-svelte";
  import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
  import { AspectRatio } from "carbon-components-svelte";
  import {
    identitiesInTree,
    identityMap,
    mempool,
    nostrocketParticipantProfiles,
    nostrocketParticipants,
  } from "$lib/stores/state";
  import AddIdentity from "../modals/AddIdentity.svelte";
  import Profile from "../Profile.svelte";
</script>

<AddIdentity />
<h2>These people have joined Nostrocket</h2>
<Row>
  <Column>
    <InlineNotification lowContrast kind="info">
      <h4>Non-fungible Identity</h4>
      <p>
        Nostrocket uses an identity tree to make sybil attacks cheaper to
        mitigate against than it costs an attacker to conduct. Read more about
        this in the Protocol.
      </p>
    </InlineNotification>
  </Column>
</Row>
<Row>
  <Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
    <Row style="height:99%;padding:2px;">
      <Tile light style="width:100%; height:100%;overflow:hidden;">
        <Row>
          <Column>
            <AspectRatio ratio="1x1" style="width:100%;">
              todo: get user image from profile if we have pubkey, or use
              silhouette if none.
            </AspectRatio>
          </Column>
          <Column>
            <Button icon={User}>REQUEST TO JOIN</Button>
            <p>#{$nostrocketParticipants.length}</p>
          </Column>
        </Row>
      </Tile>
    </Row>
  </Column>
  {#each $nostrocketParticipantProfiles as p, i (p.profile.hexpubkey())}
    <Profile profile={p.profile} num={p.index} />
  {/each}
</Row>
