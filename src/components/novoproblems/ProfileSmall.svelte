<script lang="ts">
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import {
    AspectRatio,
    Column,
    Row,
    Tile
  } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { derived, type Readable } from "svelte/store";
  export let pubkey: string;

  let blankAvatar =
    "data:image/jpeg;base64,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";

  $:pubkey = pubkey
  let image: Readable<string>
  $:image = derived(profiles, ($profiles) => {
    let p = $profiles.get(pubkey);
    if (p) {
      if (p.profile) {
        if (p.profile.image) {
          if (p.profile.image.length > 0) {
            return p.profile.image;
          }
        }
      }
    }
    return blankAvatar;
  })
</script>

<Tile
  light
  style="max-width:120px; height:100%;overflow:hidden;margin-top:6px;padding:0;"
>
  <Row>
    <Column>
      <AspectRatio ratio="1x1" style="width:100%;">
        <div style="margin:0;">
          <img width="100%" height="auto" src={$image} />
        </div>
      </AspectRatio>
      <div style="text-align:center;overflow:hidden;">
        <CommentUser {pubkey} />
      </div>
    </Column>
  </Row>
</Tile>
