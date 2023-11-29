<script lang="ts">
  import { page } from "$app/stores";
  import makeEvent from "$lib/helpers/eventMaker";
  import { makeHtml } from "$lib/helpers/mundane";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    HandleProblemEvent,
    hasOpenChildren,
  } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Breadcrumb,
    Button,
    Column,
    InlineNotification,
    OverflowMenu,
    Row,
    Select,
    SelectItem,
    SelectItemGroup,
    SkeletonText,
    Tag,
    Tile,
    breakpointObserver,
  } from "carbon-components-svelte";
  import {
    ChevronDown,
    CloseOutline,
    Stop,
    UserAvatarFilledAlt,
  } from "carbon-icons-svelte";
  import { get } from "svelte/store";
  import CommentUser from "../../../components/comments/CommentUser.svelte";
  import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
  import Divider from "../../../components/elements/Divider.svelte";
  import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";
  import ProblemStatusContainer from "../../../components/problems/ProblemStatusContainer.svelte";
  import { rootProblem } from "../../../settings";

  let problem: Problem | undefined;
  // let createdBy: NDKUserProfile | undefined;
  //let claimedBy: NDKUserProfile | undefined;
  let selected_problem: string | undefined = undefined;

  let claimable = false;
  let statusErrorText: string | undefined = undefined;
  const size = breakpointObserver();

  let currentUserIsMaintainer = false;

  $: {
    if (
      $consensusTipState.RocketMap.get(problem?.Rocket)?.Maintainers.has(
        $currentUser?.pubkey
      )
    ) {
      currentUserIsMaintainer = true;
    }
    problem = $consensusTipState.Problems.get($page.params.id);
    if (problem) {
      claimable =
        !hasOpenChildren(problem, $consensusTipState) &&
        problem.Status == "open";
    }

    if (statusErrorText) {
      setTimeout(() => {
        statusErrorText = undefined;
      }, 5000);
    }
  }

  // $: if (Boolean(problem?.CreatedBy) && !createdBy) {
  //     (async () => {
  //         const createdByUser = $ndk_profiles.getUser({hexpubkey: problem?.CreatedBy});
  //         await createdByUser.fetchProfile();
  //         createdBy = createdByUser.profile;
  //     })();
  // }

  // $: if (Boolean(problem?.ClaimedBy) && !claimedBy) {
  //     (async () => {
  //         const claimedByUser = $ndk_profiles.getUser({hexpubkey: problem?.ClaimedBy});
  //         await claimedByUser.fetchProfile();
  //         claimedBy = claimedByUser.profile;
  //     })();
  // }

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

  const onUpdateProblemStatus = (status: string) => {
    updateStatus(status)
      .then(console.log)
      .catch((error) => {
        console.error(error);
        statusErrorText = error;
      });
  };

  const problemStatus = (problem: Problem) => {
    if (
      problem?.Status === "open" &&
      hasOpenChildren(problem, $consensusTipState)
    ) {
      return "openChildren";
    }

    if (
      problem?.Status === "open" &&
      !hasOpenChildren(problem, $consensusTipState)
    ) {
      return "open";
    }

    return problem.Status;
  };
</script>

{#if Boolean(problem)}
  <Row>
    <Column sm={12} md={5} lg={9} class="problem-content">
      <Row>
        <Column>
          {#if $size === "sm"}
            <Row>
              <Column style="padding-bottom: 5px">
                <ProblemStatusContainer status={problemStatus(problem)} />
              </Column>
            </Row>
          {/if}
          <Row>
            <Column>
              <h4 style="text-transform: capitalize">
                {problem?.Title}
              </h4>
            </Column>
          </Row>
        </Column>
      </Row>

      <Row padding>
        <Column>
          <Tile>
            <h5 style="padding-bottom: 15px">Summary</h5>
            <p>{problem?.Summary || ""}</p>
          </Tile>
        </Column>
      </Row>

      <Row padding>
        <Column>{@html makeHtml(problem?.FullText)}</Column>
      </Row>

      <Row padding>
        <Column>
          <CommentsContainer parentId={problem?.UID} isRoot={true} />
        </Column>
      </Row>
    </Column>

    <Column md={2} lg={3} class="problem-sidebar">
      {#if $size !== "sm"}
        <Row>
          <Column style="padding-bottom: 5px">
            <ProblemStatusContainer status={problemStatus(problem)} />
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
          <h5>Rockets</h5>
          <Tag type="purple" style="margin: 10px 0">
            {$consensusTipState.RocketMap.get(problem.Rocket)?.Name}
          </Tag>
        </Column>
      </Row>

      <Row padding>
        <Column>
          <Divider />
        </Column>
      </Row>

      <Row>
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

          <br /><br />
          <div style="display: flex; align-items: center">
            {#if claimable}
              <Button
                size={"field"}
                on:click={() => onUpdateProblemStatus("claimed")}
                fullWidth
                style="padding: 10px; min-width: 86%"
              >
                Claim problem and work on it now
              </Button>
            {/if}
            {#if problem?.Status === "claimed" && $currentUser?.pubkey == problem.ClaimedBy}
              <Button
                size={"field"}
                disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
                on:click={() => onUpdateProblemStatus("patched")}
                style="padding: 10px; min-width: 86%"
                fullWidth
              >
                Mark as patched and ready for review
              </Button>
            {/if}

            <OverflowMenu icon={ChevronDown} flipped>
              <Button
                slot="menu"
                kind="secondary"
                iconDescription="more"
                icon={ChevronDown}
                size={"field"}
              />
              <LogNewProblemModal existing={problem} button={false} />
            </OverflowMenu>
          </div>
          {#if problem?.Status === "claimed" && $currentUser?.pubkey == problem.ClaimedBy}
            <Button
              disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
              icon={Stop}
              size="field"
              kind="tertiary"
              on:click={() => onUpdateProblemStatus("open")}
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
              on:click={() => onUpdateProblemStatus("closed")}
              style="width: 100%; margin: 15px 0"
              kind={problem?.Status === "patched" ? "primary" : "danger"}
              icon={CloseOutline}
              fullWidth
            >
              Close this problem
            </Button>
          {/if}
          <br />
          <LogNewProblemModal parent={problem} button={true} />
        </Column>
      </Row>

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

          {#if $currentUser?.pubkey == problem?.CreatedBy}
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
          {/if}
          <Button
            kind="tertiary"
            on:click={() => {
              console.log(problem);
            }}
            >Print this problem to the console
          </Button>
        </Column>
      </Row>
    </Column>
  </Row>
{:else}
  <Row padding>
    <Column>
      <Breadcrumb noTrailingSlash skeleton count={2} />
    </Column>
  </Row>

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
