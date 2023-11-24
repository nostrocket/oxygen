<script lang="ts">
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
  import { nostrocketMaintainerProfiles, nostrocketParticipantProfiles } from "$lib/stores/nostrocket_state/master_state";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import type { Readable } from "svelte/motion";

  export let type:string = "participants"

  let store: Readable<{
    profile: NDKUser;
    index: number;
}[]> = nostrocketParticipantProfiles

  let sortedStore:{
    profile: NDKUser;
    index: number;
}[]

  $: {
    sortedStore = [...$store].sort((a, b) => b.index - a.index);
  }

  onMount(()=>{
    if (type == "maintainers") {store = nostrocketMaintainerProfiles}
  })
</script>

<div style="display:none;"><AddIdentity type={type} /></div>
<!-- add identity form breaks without this for some weird reason -->
{#if type == "participants"}<h2>These people have joined Nostrocket</h2>{/if}
{#if type == "maintainers"}<h2>These people are Maintainers</h2>{/if}

{#if type == "participants"}
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
{/if}
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
            {#if type=="participants"}<RequestToJoin />{/if}
            <p>#{$store.length}</p>
          </Column>
        </Row>
        <AddIdentity type={type}/>
      </Tile>
    </Row>
  </Column>
  {#each sortedStore as p, i (p.profile.pubkey)}
    <Profile profile={p.profile} num={p.index} />
  {/each}
</Row>
