<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    StructuredListCell,
    StructuredListRow,
    Tag,
  } from "carbon-components-svelte";
  import { Report } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  export let rocket: Rocket | undefined = undefined;

  $: requiresConsensus = rocket._requriesConsensus.length > 0;

</script>

{#if rocket}
  <StructuredListRow>
    <StructuredListCell noWrap
      ><h3>
        {rocket.Name} <a href="{base}/rockets/{rocket.UID}"><Report /></a>
      </h3>
      <CommentUser pubkey={rocket.CreatedBy} /></StructuredListCell
    >
    <StructuredListCell
      >{#if requiresConsensus}<Tag
          interactive
          on:click={() => {
            goto(
              `${base}/FAQ/283c5a5f528369691c1c873ea141c2ed67a0bfdb397aaccb3edbd38586f69beb`
            );
          }}
          type="red">UNCONFIRMED</Tag
        >{/if}
      <RocketTag type="problem-tag" {rocket} />
      <Tag
        interactive
        on:click={() => {
          goto(base + "/rockets/" + rocket.UID + "/merits");
        }}>{rocket.Merits.size} Merit Requests</Tag
      ></StructuredListCell
    >
    <StructuredListCell>
      <RocketTag {rocket} type="text-link" />
      {#if rocket.Mission}<br />MISSION: {rocket.Mission}{/if}
    </StructuredListCell>
  </StructuredListRow>
{/if}
