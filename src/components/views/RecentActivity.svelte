<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { formatDateTime } from "$lib/helpers/mundane";
  import { labelledTag } from "$lib/helpers/shouldBeInNDK";
  import { kindToVerb } from "$lib/stores/event_sources/kinds";
  import { notesInState } from "$lib/stores/nostrocket_state/master_state";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { Row, Tile } from "carbon-components-svelte";
  import CommentUser from "../../components/comments/CommentUser.svelte";

  function onclick(ev: NDKEvent): void {
    let path: string | null = null;
    let problemID: string | undefined;
    switch (ev.kind) {
      case 1031:
      let rocket = labelledTag(ev, "problem", "e");
      case 1972:
        problemID = labelledTag(ev, "problem", "e");
        if (problemID) {
          path = "nr/Nostrocket/problems/" + problemID;
        } else {
          console.log("could not find problem ID");
        }
        break;
      case 1971:
        problemID = labelledTag(ev, "problem", "e");
        if (problemID) {
          path = "nr/Nostrocket/problems/" + problemID;
        } else {
          path = "nr/Nostrocket/problems/" + ev.id;
        }
        break;
    }
    if (path) {
      goto(`${base}/${path}`);
    }
  }
</script>

<Row>
  <Tile light style="margin-bottom:1%;width:100%">
    <h3>RECENT ACTIVITY</h3>
    {#each $notesInState as note}
      <Tile
        style="margin-top:2px;cursor:pointer"
        on:click={() => {
          onclick(note);
        }}
      >
        <p style="float:left;">
          <span style="color:orange;"
            ><CommentUser textOnly pubkey={note.pubkey} /></span
          >: {kindToVerb(note)}
        </p>
        <p style="color:grey;float:right;">{formatDateTime(note.created_at)}</p>
      </Tile>
    {/each}
  </Tile>
</Row>
