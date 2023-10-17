<script>
  import { nostrocketParticipantProfiles } from "$lib/consensus/state";
  import {
    AspectRatio,
    Button,
    Column,
    InlineNotification,
    Row,
    Tile,
  } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";
  import Profile from "../Profile.svelte";
  import AddIdentity from "../modals/AddIdentity.svelte";
</script>

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
      <AddIdentity />
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
            <p>#{$nostrocketParticipantProfiles.length}</p>
          </Column>
        </Row>
      </Tile>
    </Row>
  </Column>
  {#each $nostrocketParticipantProfiles as p, i (p.profile.pubkey)}
    <Profile profile={p.profile} num={p.index} />
  {/each}
</Row>
