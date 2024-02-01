<script lang="ts">
  import { UpdateStatus } from "$lib/helpers/publishProblem";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    Column,
    InlineNotification,
    Row,
    Tag,
    TextInput,
  } from "carbon-components-svelte";
  import {
    ArrowRight,
    CloseOutline,
    Stop,
    UserAvatarFilledAlt,
  } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import Divider from "../elements/Divider.svelte";
  import LoginButtonWithError from "../elements/LoginButtonWithError.svelte";
  import ClaimModal from "../novoproblems/modals/ClaimModal.svelte";
  import ProblemButton from "./ProblemButton.svelte";
  import ProblemStatusContainer from "./ProblemStatusContainer.svelte";
  import { writable } from "svelte/store";
  import makeEvent from "$lib/helpers/eventMaker";
  import { relayHint } from "../../settings";

  let statusErrorText: string | undefined = undefined;
  $: {
    if (statusErrorText) {
      setTimeout(() => {
        statusErrorText = undefined;
      }, 5000);
    }
  }

  export let currentUserIsMaintainer = false;

  export let status: string;
  export let problem:Problem;
  export let claimable: boolean;
  let claimModalOpen = false;
  let patchLinkInput = false;
  let patchLink = "";

  $: patchLinkInput = patchLinkInput;

  let rocket: Rocket | undefined = undefined;
  $: rocket = $consensusTipState.RocketMap.get(problem.Rocket);
</script>

<Row>
  <Column style="padding-bottom: 5px">
    <ProblemStatusContainer problem={problem} {status} />
  </Column>
</Row>

<Row padding>
  <Column>
    <Divider />
  </Column>
</Row>

{#if rocket}
  <Row>
    <Column>
      <h5>Rocket</h5>
      <Tag type="purple" style="margin: 10px 0">
        {rocket.Name}
      </Tag>
      <br />
      {#each rocket.Repositories as repo}
        <a href={repo.toString()}>{repo.toString()}</a>
      {/each}
      {#if rocket.Repositories.size == 0 && $currentUser?.pubkey == rocket.CreatedBy}
        <InlineNotification
          title="WARNING"
          subtitle={rocket.Name +
            " does not have any repositories configured, so users don't know where to send pull requests. Please configure a repository for " +
            rocket.Name +
            " now."}
        />
      {/if}
    </Column>
  </Row>

  <Row padding>
    <Column>
      <Divider />
    </Column>
  </Row>
{/if}

<Row padding>
  <Column>
    <h5>People</h5>

    <div
      style="display: flex; align-items: center; text-align: center; margin-top: 10px"
    >
      <UserAvatarFilledAlt size={32} />
      <p><CommentUser large pubkey={problem.CreatedBy} /></p>
      <span style="color: #94a3b8"> <Tag type="teal">creator</Tag></span>
    </div>

    {#if problem?.Status === "claimed" || problem?.Status === "patched"}
      <div
        style="display: flex; align-items: center; text-align: center; margin-top: 10px"
      >
        <UserAvatarFilledAlt size={32} />
        <p><CommentUser large pubkey={problem.ClaimedBy} /></p>
        <span style="color: #94a3b8">
          <Tag type="magenta">contributor</Tag></span
        >
      </div>
    {/if}
  </Column>
</Row>

<br /><br />
{#if !$currentUser}<LoginButtonWithError reason="view these actions" />{:else}
  <Row padding>
    <Column>
      {#if claimable}
        <ClaimModal
          bind:open={claimModalOpen}
          callback={() => {
            UpdateStatus(problem, "claimed")
              .then(console.log)
              .catch((error) => {
                console.error(error);
                statusErrorText = error;
              });
          }}
        />
        <Button
          icon={ArrowRight}
          size={"field"}
          on:click={() => {
            claimModalOpen = true;
          }}
          style="width: 100%; margin: 15px 0"
        >
          Claim problem and work on it now
        </Button>
      {/if}
      {#if problem?.Status === "claimed" && $currentUser?.pubkey == problem.ClaimedBy}
        <Button
          size={"field"}
          disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
          on:click={() => {
            patchLinkInput = true;
          }}
          style="width: 100%; margin: 15px 0"
        >
          Mark as patched and ready for review
        </Button>
        <br />
        {#if patchLinkInput}
          <Row padding>
            <Column>
              <h4>Link to pull request or other solution</h4>
              <TextInput bind:value={patchLink} />
              <Button
                on:click={() => {
                  let url = new URL(patchLink);
                  if (!url) {
                    throw new Error("invalid URL");
                  }
                  let textEvent = makeEvent({
                    kind: 1,
                    rocket: problem.Rocket,
                  });
                  textEvent.tags.push(["p", problem.CreatedBy]);
                  textEvent.tags.push(["e", problem.UID, relayHint, "root"]);
                  textEvent.content =
                    "I have resolved this problem with a patch: " +
                    url.toString();
                  textEvent.publish().then(() => {
                    UpdateStatus(problem, "patched")
                      .then(console.log)
                      .catch((error) => {
                        console.error(error);
                        statusErrorText = error;
                      });
                  });
                }}>DO IT</Button
              >
            </Column>
          </Row>
        {/if}
      {/if}
      <!-- 
        <OverflowMenu icon={ChevronDown} flipped>
          <Button
            slot="menu"
            kind="secondary"
            iconDescription="more"
            icon={ChevronDown}
            size={"field"}
          />
          <LogNewProblemModal existing={problem} button={false} />
        </OverflowMenu> -->
      {#if problem?.Status === "claimed" && $currentUser?.pubkey == problem.ClaimedBy}
        <Button
          disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
          icon={Stop}
          size="field"
          kind="tertiary"
          on:click={() => {
            UpdateStatus(problem, "open")
              .then(console.log)
              .catch((error) => {
                console.error(error);
                statusErrorText = error;
              });
          }}
          style="width: 100%; margin: 15px 0"
        >
          Abandon this problem
        </Button>
      {/if}
      {#if problem?.Status !== "closed" && ($currentUser?.pubkey == problem?.CreatedBy || currentUserIsMaintainer)}
        <Button
          size={"field"}
          disabled={!(
            problem?.CreatedBy == $currentUser?.pubkey ||
            currentUserIsMaintainer
          )}
          on:click={() => {
            UpdateStatus(problem, "closed")
              .then(console.log)
              .catch((error) => {
                console.error(error);
                statusErrorText = error;
              });
          }}
          style="width: 100%; margin: 15px 0"
          kind={problem?.Status === "patched" ? "primary" : "danger"}
          icon={CloseOutline}
        >
          Close this problem
        </Button>
      {/if}
      {#if problem.Status == "closed"}
        {#if $currentUser?.pubkey == problem?.CreatedBy || currentUserIsMaintainer}
          <Button
            size={"field"}
            on:click={() => {
              UpdateStatus(problem, "open")
                .then(console.log)
                .catch((error) => {
                  console.error(error);
                  statusErrorText = error;
                });
            }}
            style="width: 100%; margin: 15px 0"
            kind="danger-tertiary"
            icon={ArrowRight}
          >
            Re-Open this problem
          </Button>
        {/if}
        <br />
      {/if}
      {#if problem.Status == "open"}
      <ProblemButton parent={problem} />
    {/if}
    </Column>
  </Row>
{/if}

<Row padding>
  <Column>
    <Divider />
  </Column>
</Row>

<Row>
  <Column>
    {#if statusErrorText}
      <InlineNotification
        title="Error:"
        subtitle={statusErrorText}
        on:close={(statusErrorText = undefined)}
      />
    {/if}

    <!-- {#if $currentUser?.pubkey == problem?.CreatedBy}
          <Row>
            <Column>
              <h5 style="padding-bottom: 10px">
                Add a child to this problem
              </h5>
              <p>
                You should do this if there's an existing problem that is
                blocking this one from being solved.
              </p>
            </Column>
          </Row>
          <br />
          <Select
            hideLabel
            size="xl"
            labelText="Status"
            bind:selected={selected_problem}
            fullWidth
          >
            <SelectItemGroup
              label="SELECT A PROBLEM THAT IS BLOCKING THIS ONE"
            >
              {#each $consensusTipState.Problems as [key, p]}
                {#if key !== problem?.UID && p.Status == "open" && p.UID != rootProblem}
                  <SelectItem value={key} text={p.Title} />
                {/if}
              {/each}
            </SelectItemGroup>
          </Select>
          <br />
          {#if selected_problem}
            <Button size="field">DO IT</Button>
          {/if}

          <Row padding>
            <Column>
              <Divider />
            </Column>
          </Row>
        {/if} -->

  </Column>
</Row>
