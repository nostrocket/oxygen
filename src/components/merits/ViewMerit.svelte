<script lang="ts">
  import { goto } from "$app/navigation";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { MeterChart, ChartTheme } from "@carbon/charts-svelte";
  import {
    Tile,
    Tag,
    Accordion,
    ButtonSet,
    Button,
  } from "carbon-components-svelte";
  import { CheckmarkOutline, MisuseOutline } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import CuckLoserBucks from "../elements/CuckLoserBucks.svelte";
  import ProblemComponent from "../problems/ProblemComponent.svelte";
  import { base } from "$app/paths";
  import type { Merit, Rocket } from "$lib/stores/nostrocket_state/types";
  import makeEvent from "$lib/helpers/eventMaker";

  function getRepo(r:Rocket) {
    if (r) {
      if (r.Repositories.size > 0) {
        return new URL(r?.Repositories.entries().next().value[0]).toString();
      }
    }
    return undefined
}
  function vote(direction: string, request: Merit) {
    let e = makeEvent({ kind: 1603, rocket: request.RocketID });
    e.tags.push(["vote", direction]);
    e.tags.push(["e", request.UID, "merit"]);
    e.content = "I have voted to " + direction + " this request for Merits.";
    e.publish();
  }

  export let merit: Merit;
  export let rocket:Rocket;
  export let hideProblem = false;
</script>

<Tile>
  {#if merit._requriesConsensus.length > 0}<p>
      <Tag
        interactive
        on:click={() => {
          goto(
            `${base}/FAQ/283c5a5f528369691c1c873ea141c2ed67a0bfdb397aaccb3edbd38586f69beb`
          );
        }}
        type="red">UNCONFIRMED</Tag
      >
    </p>{/if}
  {#if merit.Ratified}<Tag interactive type="green">RATIFIED</Tag>{/if}
  {#if merit.Blackballed}<Tag interactive type="red">BLACKBALLED</Tag>{/if}
  {#if !merit.Ratified && !merit.Blackballed}
    <MeterChart
      data={[
        {
          group: "ratified",
          value: merit.RatifyPermille,
        },
        {
          group: "blackballed",
          value: merit.BlackballPermille,
        },
      ]}
      options={{
        meter: { showLabels: false, proportional: { total: 1000 } },
        height: "12px",
        theme: ChartTheme.G100,
        toolbar: { enabled: false },
        legend: { enabled: false },
        color: {
          scale: {
            blackballed: "red",
            ratified: "green",
          },
        },
      }}
    />
  {/if}
  <p>
    Requested By: <CommentUser pubkey={merit.CreatedBy} />
    <br />
    <span
      >Amount in Sats: {merit.Amount}
      <CuckLoserBucks sats={merit.Amount} /></span
    >
    <br />
    {#if !hideProblem}
    <Accordion
      ><ProblemComponent
        onlyShowThisProblem
        dontShowExtraChildren
        problemID={merit.Problem}
      /></Accordion
    >{/if}
    <Tile light>
      <h6>
        If the Contributor has commented on the problem with a link to a commit
        it will be displayed here:
      </h6>
      <CommentsWrapper
        disableReplies
        parentId={merit.Problem}
        isRoot={true}
        filter={getRepo(rocket)}
        pubkey={merit.CreatedBy}
      />
    </Tile>
  </p>
  <ButtonSet>
    <Button
      disabled={merit.hasVoted($currentUser?.pubkey)}
      on:click={() => {
        vote("ratify", merit);
      }}
      kind="primary"
      icon={CheckmarkOutline}>RATIFY</Button
    >
    <Button
      disabled={merit.hasVoted($currentUser?.pubkey)}
      on:click={() => vote("blackball", merit)}
      kind="danger"
      icon={MisuseOutline}>BLACKBALL</Button
    >
    <Button
      kind="ghost"
      on:click={() => {
        console.log(merit);
      }}>PRINT OBJECT TO CONSOLE</Button
    >
  </ButtonSet>
</Tile>
