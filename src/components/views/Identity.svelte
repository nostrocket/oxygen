<script>
  import { nostrocketParticipantProfiles } from "$lib/stores/nostrocket_state/soft_state/identity";
  import {
    AspectRatio,
    Column,
    InlineNotification,
    Row,
    Tile,
  } from "carbon-components-svelte";
  import Profile from "../elements/Profile.svelte";
  import AddIdentity from "../modals/AddIdentity.svelte";
  import RequestToJoin from "../modals/RequestToJoin.svelte";
  import { User } from "carbon-pictograms-svelte";
  //import { nostrocketParticipantProfiles } from "$lib/consensus/state";
</script>

<div style="display:none;"><AddIdentity /></div>
<!-- add identity form breaks without this for some weird reason -->
<h2>These people have joined Nostrocket</h2>
<Row>
  <Column>
    <InlineNotification lowContrast kind="info">
      <h4>Nostrocket Identity Tree</h4>
      <p>
        The Identity Tree makes sybil attacks socially expensive, and very cheap
        to mitigate against. Only people in the tree can add others to it... <a
          href="#">more</a
        >
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
              <User />
            </AspectRatio>
          </Column>
          <Column>
            <RequestToJoin />
            <p>#{$nostrocketParticipantProfiles.length}</p>
          </Column>
        </Row>
        <AddIdentity />
      </Tile>
    </Row>
  </Column>
  {#each $nostrocketParticipantProfiles as p, i (p.profile.pubkey)}
    <Profile profile={p.profile} num={p.index} />
  {/each}
</Row>
