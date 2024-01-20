<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Column,
    Row,
    StructuredListCell,
    StructuredListRow,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import { Report } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  import ColumnTile from "../elements/ColumnTile.svelte";
  export let rocket: Rocket | undefined = undefined;

  $: requiresConsensus = rocket._requriesConsensus.length > 0;
</script>

{#if rocket}
  <Tile style="padding:0;margin-top:6px;">
    <Row>
      <Column lg={5} 
        ><Tile
          ><h3>
            {#if requiresConsensus}<Tag
                interactive
                on:click={() => {
                  goto(
                    `${base}/FAQ/283c5a5f528369691c1c873ea141c2ed67a0bfdb397aaccb3edbd38586f69beb`
                  );
                }}
                type="red">UNCONFIRMED</Tag
              >{/if}<span style="cursor:pointer" on:click={()=>{goto(`${base}/${rocket.Name}`)}}>{rocket.Name}</span>
            <a href="{base}/rockets/{rocket.UID}"></a>
          </h3>
          <CommentUser pubkey={rocket.CreatedBy} /></Tile
        ></Column
      >
      <Column lg={3} 
        ><Tile
          ><RocketTag type="problem-tag" {rocket} />
          <Tag
            interactive
            on:click={() => {
              goto(`${base}/${rocket?.Name}/merits`);
            }}>{rocket.Merits.size} Merit Requests</Tag
          ></Tile
        ></Column
      >
      <Column lg={8} 
        ><Tile
          ><RocketTag {rocket} type="text-link" />
          {#if rocket.Mission}<div style="margin-top: 10px;">
              <p>MISSION: {rocket.Mission}</p>
            </div>{/if}</Tile
        ></Column
      >
    </Row>
  </Tile>
{/if}
