<script lang="ts">
  import { page } from "$app/stores";
  import makeEvent from "$lib/helpers/eventMaker";
  import { makeHtml } from "$lib/helpers/mundane";
  import { ndk } from "$lib/stores/event_sources/relays/ndk";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
  import {
    Button,
    Column,
    InlineNotification,
    Row,
    SkeletonText,
    Tile
  } from "carbon-components-svelte";
  import {
    Chat,
    PlayFilledAlt,
    Stop
  } from "carbon-icons-svelte";
  import { AcceleratedComputing, DesignLeadership, DoNot, Idea, Management } from "carbon-pictograms-svelte";
  import { get } from "svelte/store";
  import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";
  import { HandleProblemEvent, hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";

  let problem: Problem | undefined;
  let createdBy: NDKUserProfile | undefined;
  let claimedBy: NDKUserProfile | undefined;

  let claimable = false;
  let statusErrorText: string | undefined = undefined;

  $: {
    problem = $consensusTipState.Problems.get($page.params.id);
    if (problem) {
      claimable = (!hasOpenChildren(problem, $consensusTipState) && problem.Status == "open");
      console.log(claimable)
    }
    
    if (statusErrorText) {
      setTimeout(() => {
        statusErrorText = undefined;
      }, 5000);
    }
  }

  $: if (Boolean(problem?.CreatedBy) && !createdBy) {
    (async () => {
      const createdByUser = $ndk.getUser({ hexpubkey: problem?.CreatedBy });
      await createdByUser.fetchProfile();
      createdBy = createdByUser.profile;
    })();
  }

  $: if (Boolean(problem?.ClaimedBy) && !claimedBy) {
    (async () => {
      const claimedByUser = $ndk.getUser({ hexpubkey: problem?.ClaimedBy });
      await claimedByUser.fetchProfile();
      claimedBy = claimedByUser.profile;
    })();
  }

  function updateStatus(newStatus: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!problem) {
        reject("problem is missing");
      }
      if (!$currentUser) {
        reject("user not logged in");
      }
      let e = makeEvent({ kind: 1972 });
      e.tags.push(["e", problem!.UID, "problem"]);
      e.tags.push(["status", newStatus]);
      e.author = get(currentUser)!;
      let err = HandleProblemEvent(e, get(consensusTipState).Copy());
      if (err != undefined) {
        reject(err);
      } else {
        e.publish()
          .then(() => {
            console.log(e);
            resolve("published");
          })
          .catch((err) => {
            reject(err);
          });
      } 
    });
  }
</script>

{#if Boolean(problem)}
  <Row>
    <Column sm={12} md={9} lg={9} class="problem-content">
      <Row>
        <Column>
          <Row>
            <Column>
              <h3 style="text-transform: capitalize">
                {problem?.Title}
              </h3>
            </Column>
          </Row>
        </Column>
      </Row>

      <Row padding>
        <Column>
          <Tile>
            <h5 style="padding-bottom: 15px">Summary</h5>
            {problem?.Summary || ""}
          </Tile>
        </Column>
      </Row>

      <Row padding>
        <Column style="text-align: justify; text-justify: inter-word"
          >{@html makeHtml(problem?.FullText)}</Column
        >
      </Row>
    </Column>

    <Column md={2} lg={3} class="problem-sidebar">
      <Row>
        <Column style="padding-bottom: 5px">
          <p
            style="display: flex; align-items: center; text-transform: capitalize"
          >
            {#if problem?.Status == "open" && hasOpenChildren(problem, $consensusTipState)}<span
                style="color:blueviolet"
                ><Management /> HAS OPEN CHILDREN</span
              >
            {/if}
            {#if problem?.Status == "open" && !hasOpenChildren(problem, $consensusTipState)}<span
                style="color:green"><Idea /> OPEN AND CAN BE CLAIMED</span
              >
            {/if}
            {#if problem?.Status == "claimed"}<span style="color:orange"
                ><AcceleratedComputing /> CLAIMED AND IN PROGRESS</span
              >
            {/if}
            {#if problem?.Status == "patched"}<span style="color:orange"
                ><DesignLeadership /> PATCHED AND WAITING FOR VALIDATION</span
              >
            {/if}
            {#if problem?.Status == "closed"}<span style="color:red"
                ><DoNot /> CLOSED</span
              >
            {/if}
          </p>
        </Column>
      </Row>
      <Row>
        <Column style="padding-bottom: 5px">
          <p
            style="display: flex; align-items: center; text-transform: capitalize"
          >
            <Chat />&nbsp;&nbsp;{problem?.Children?.size ?? 0} Sub problems
          </p>
        </Column>
      </Row>

      <Row>
        <Column>
          <p style="color: #94a3b8">
            Logged by <span style="color: #fb923c">{createdBy?.name}</span>
          </p>
          {#if problem?.Status == "claimed"}<p style="color: #94a3b8">
              Claimed by <span style="color: #fb923c">{claimedBy?.name}</span>
            </p>{/if}

            {#if problem?.Status == "patched"}<p style="color: #94a3b8">
                Patched by <span style="color: #fb923c">{claimedBy?.name}</span>
              </p>{/if}
        </Column>
      </Row>

      <Row padding>
        <Column>
          <div style="border-bottom: 1px solid #262626; height: 5px" />
        </Column>
      </Row>

      <Row>
        <Column>
          <LogNewProblemModal parent={problem} />
          <br /><br />
          <LogNewProblemModal existing={problem} />
          {#if claimable} 
          <br /><br />
          <Button
          icon={PlayFilledAlt}
          size="small"
          kind="primary"
          on:click={() => {
            updateStatus("claimed")
              .then((response) => {
                console.log(response);
              })
              .catch((response) => {
                console.log(response);
                statusErrorText = response;
              });
          }}>Claim this problem and work on it now</Button
        >
        {/if}

        {#if problem?.Status == "claimed"}
        <br /><br />
          <Button
          disabled={!(problem?.ClaimedBy == $currentUser?.pubkey)}
          icon={PlayFilledAlt}
          size="small"
          kind="primary"
          on:click={() => {
            updateStatus("patched")
              .then((response) => {
                console.log(response);
              })
              .catch((response) => {
                console.log(response);
                statusErrorText = response;
              });
          }}>Mark this problem as patched and ready for review</Button
        >

        <br /><br />
        <Button
        disabled={!(problem?.ClaimedBy == $currentUser?.pubkey)}
        icon={Stop}
        size="small"
        kind="primary"
        on:click={() => {
          updateStatus("open")
            .then((response) => {
              console.log(response);
            })
            .catch((response) => {
              console.log(response);
              statusErrorText = response;
            });
        }}>Abandon this problem</Button
      >
        {/if}

        {#if problem?.Status != "closed"}
        <br /><br />
          <Button
          disabled={!(problem?.CreatedBy == $currentUser?.pubkey)}
          icon={PlayFilledAlt}
          size="small"
          kind={problem?.Status == "patched"? "primary" : "danger"}
          on:click={() => {
            updateStatus("closed")
              .then((response) => {
                console.log(response);
              })
              .catch((response) => {
                console.log(response);
                statusErrorText = response;
              });
          }}>Close this problem</Button
        >
        {/if}


      {#if statusErrorText}
      <InlineNotification
        title="Error:"
        subtitle={statusErrorText}
        on:close={(statusErrorText = undefined)}
      />
    {/if}
    <br /><br />
    <Button on:click={()=>{console.log(problem)}}>Print this problem to the console</Button>

        </Column>
      </Row>

    </Column>
  </Row>
{:else}
  <Row padding>
    <Column>
      <SkeletonText heading />
    </Column>
  </Row>
  <Row>
    <Column>
      <SkeletonText paragraph />
    </Column>
  </Row>
{/if}
