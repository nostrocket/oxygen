<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { page } from "$app/stores";
  import {
    Button,
    Column,
    InlineNotification,
    OverflowMenu,
    OverflowMenuItem,
    Row,
    SkeletonText,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import {
    Chat,
    Unlocked,
    ManageProtection,
    PlayFilledAlt,
    Locked,
    Time,
    DeliveryParcel,
    Close,
    Stop,
    InProgress,
    InProgressWarning,
  } from "carbon-icons-svelte";
  import { ndk } from "$lib/stores/event_sources/relays/ndk";
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { makeHtml } from "$lib/helpers/mundane";
  import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nostrocketIgnitionEvent } from "../../../settings";
  import { handleProblemStatusChangeEvent } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import { get } from "svelte/store";

  let problem: Problem | undefined;
  let createdBy: NDKUserProfile | undefined;
  let claimedBy: NDKUserProfile | undefined;

  let claimable = false;
  let statusErrorText: string | undefined = undefined;

  $: {
    problem = $consensusTipState.Problems.get($page.params.id);
    claimable = problem?.Children.size == 0 && problem.Status == "open";
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

      // if (!$consensusTipState.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant($currentUser!.pubkey)) {
      //     reject("current user is not in the Identity Tree")
      // }
      // if (newStatus == "claimed" && problem?.Status != "open") {
      //     reject("cannot claim a problem that isn't open")
      // }
      // if (newStatus == "close" && problem?.CreatedBy != $currentUser?.pubkey) {
      //     //todo also check if maintainer
      //     reject("you cannot close a problem unless you are the creator of it or a maintainer on its rocket")
      // }
      // if (newStatus == "patched" && (problem?.Status !== "claimed" || problem?.ClaimedBy != $currentUser?.pubkey)) {
      //     reject("you cannot mark this problem as patched unless you are the one who claimed it")
      // }
      let e = makeEvent({ kind: 1972 });
      e.tags.push(["e", problem!.UID, "problem"]);
      e.tags.push(["status", newStatus]);
      e.author = get(currentUser)!;
      let [error, success] = handleProblemStatusChangeEvent(
        e,
        get(consensusTipState).Copy()
      );
      if (!success) {
        reject(error);
      }
      if (success) {
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
            <Column md={4}>
              <h3 style="text-transform: capitalize">
                {problem?.Title}
              </h3>
            </Column>
          </Row>
        </Column>
      </Row>

      <Row padding={20}>
        <Column>
          <Tile>
            <h5 style="padding-bottom: 15px">Summary</h5>
            {problem?.Summary || ""}
          </Tile>
        </Column>
      </Row>

      <Row padding={10}>
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
            {#if problem?.Status == "open" && problem.Children.size > 0}<span
                style="color:blueviolet"
                ><InProgressWarning /> HAS OPEN CHILDREN</span
              >
            {/if}
            {#if problem?.Status == "open" && problem.Children.size == 0}<span
                style="color:green"><Unlocked /> OPEN AND CAN BE CLAIMED</span
              >
            {/if}
            {#if problem?.Status == "claimed"}<span style="color:orange"
                ><Time /> CLAIMED AND IN PROGRESS</span
              >
            {/if}
            {#if problem?.Status == "patched"}<span style="color:orange"
                ><DeliveryParcel /> PATCHED AND WAITING FOR VALIDATION</span
              >
            {/if}
            {#if problem?.Status == "patched"}<span style="color:red"
                ><Close /> PATCHED AND WAITING FOR VALIDATION</span
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
        </Column>
      </Row>

      <Row padding>
        <Column>
          <div style="border-bottom: 1px solid #262626; height: 5px" />
        </Column>
      </Row>

      <Row padding>
        <Column>
          <LogNewProblemModal parent={problem} />
        </Column>
      </Row>

      <Row>
        <Column>
          <Button
            disabled={!claimable}
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

          {#if statusErrorText}
            <InlineNotification
              title="Error:"
              subtitle={statusErrorText}
              on:close={(statusErrorText = undefined)}
            />
          {/if}
        </Column>
      </Row>
    </Column>
  </Row>
{:else}
  <Row padding={10}>
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
