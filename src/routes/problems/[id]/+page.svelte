<script lang="ts">
  import { page } from "$app/stores";
  import { makeHtml } from "$lib/helpers/mundane";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Breadcrumb,
    Button,
    ButtonSet,
    Column,
    InlineNotification,
    Row,
    Select,
    SelectItem,
    SelectItemGroup,
    SkeletonText,
    TextArea,
    TextInput,
    Tile,
    breakpointObserver,
  } from "carbon-components-svelte";
  import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
  import ProblemSidebarActions from "../../../components/problems/ProblemSidebarActions.svelte";
  import ProblemStatusContainer from "../../../components/problems/ProblemStatusContainer.svelte";
  import { ArrowDownRight, ArrowRight, Edit, ParentChild, TextItalic } from "carbon-icons-svelte";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { UpdateStatus, publishProblem } from "$lib/helpers/publishProblem";
  import ClaimModal from "../../../components/problems/ClaimModal.svelte";
  import CommentUser from "../../../components/comments/CommentUser.svelte";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

  let currentUserIsMaintainer = false;

  let canEdit = false;
  let edit = false;
  let backupProblem: Problem;

  let statusErrorText:string|undefined = undefined;

  let rocket:Rocket | undefined;


  $: {
    if ($currentUser && problem) {
      rocket = $consensusTipState.RocketMap.get(problem.Rocket)
      if (
        rocket?.Maintainers.has(
          $currentUser?.pubkey
        )
      ) {
        currentUserIsMaintainer = true;
      }
      if (
        problem?.CreatedBy == $currentUser?.pubkey ||
        currentUserIsMaintainer
      ) {
        canEdit = true;
      }
    }
  }

  $: {
    problem = $consensusTipState.Problems.get($page.params.id);
    if (problem) {
      claimable =
        !hasOpenChildren(problem, $consensusTipState) &&
        problem.Status == "open";
    }
  }

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

{#if problem}
  <Row>
    <Column sm={16} md={16} lg={12} class="problem-content">
      <div
        style={edit
          ? "padding:6px;border:solid;border-width:thin;border-color:DodgerBlue;"
          : ""}
      >
        <Row>
          <Column>
            {#if $size == "sm" || $size == "md"}
              <Row>
                <Column style="padding-bottom: 5px">
                  <Tile>
                    <ProblemSidebarActions
                      {claimable}
                      {problem}
                      status={problemStatus(problem)}
                      {currentUserIsMaintainer}
                    />
                  </Tile>
                </Column>
              </Row>
            {/if}
            <Row>
              <Column>
                <h4 style="text-transform: uppercase">
                  {problem?.Title}
                  {#if canEdit}<a
                      href="#"
                      on:click={() => {
                        edit = true;
                      }}><Edit /></a
                    >{/if}
                </h4>
                {#if edit}<TextInput
                    bind:value={problem.Title}
                    size="sm"
                  />{/if}
              </Column>
            </Row>
          </Column>
        </Row>

        <Row padding>
          <Column>
            <Tile>
              <h5 style="padding-bottom: 15px">Summary</h5>
              <p>{problem.Summary}</p>
              {#if edit}<Tile light
                  ><TextArea bind:value={problem.Summary} /></Tile
                >{/if}
            </Tile>
          </Column>
        </Row>

        {#if !edit && problem.Status == "claimed" && problem.ClaimedBy == $currentUser?.pubkey}
          <Row padding>
            <Column>
              <Tile light>
                <h5>
                  NEXT STEPS FOR <CommentUser pubkey={$currentUser.pubkey} />
                </h5>
                <p>
                  You have claimed this problem to work on it. If you did this
                  by mistake, you should <a href="#"
                    on:click={() => {
                      UpdateStatus(problem, "open")
                        .then(console.log)
                        .catch((error) => {
                          console.error(error);
                          statusErrorText = error;
                        });
                    }}>abandon</a
                  > the problem now.
                </p>
                <hr />
                <h4>STEP 1: PROJECT REPOSITORY</h4>
                {#if rocket.Repositories.size > 0}
                To work on this problem  proceed to the
                {#if rocket.Repositories.size == 1}
                repository: 
                {/if}
                {#if rocket.Repositories.size > 1}
                the appropriate repository from the following:
                {/if}
                {#each rocket.Repositories as repo}<a href={repo.toString()}>{repo.toString()}</a>{/each}
                and then follow the <a href="#">step by step contribution guidelines</a> to solve the problem and produce a <a href="#">valid patch</a>.
                {:else}
                A repository has not been defined for {rocket?.Name}. Please contact <CommentUser pubkey={rocket.CreatedBy} /> and ask them to add a repository to {rocket?.Name}.
                {/if}
                
                {#if statusErrorText}<InlineNotification title="ERROR" subtitle={statusErrorText} />{/if}
              </Tile>
            </Column>
          </Row>
        {/if}

        <Row padding>
          <Column>{@html makeHtml(problem?.FullText)}</Column>
        </Row>
        {#if edit}
          <Row padding>
            <Column
              ><Tile light><TextArea bind:value={problem.FullText} /></Tile
              ></Column
            >
          </Row>
        {/if}

        {#if edit}
          <Select
            hideLabel
            size="xl"
            labelText="Status"
            bind:selected={problem.Rocket}
          >
            <SelectItemGroup label="SELECT WHICH ROCKET THIS BELONGS TO">
              {#each $consensusTipState.RocketMap as [key, r]}
                {#if r.CreatedBy == $currentUser?.pubkey}
                  <SelectItem value={key} text={r.Name} />
                {/if}
              {/each}
            </SelectItemGroup>
          </Select>
          <ButtonSet>
            <Button
              kind="secondary"
              size="field"
              on:click={() => {
                edit = false;
              }}>Cancel</Button
            >
            <Button
              size="field"
              on:click={() => {
                publishProblem($consensusTipState, problem);
                edit = false;
              }}>Publish Change</Button
            >
          </ButtonSet>
        {/if}
      </div>

      <Row padding>
        <Column>
          <CommentsContainer parentId={problem?.UID} isRoot={true} />
        </Column>
      </Row>
    </Column>
    {#if $size != "sm" && $size != "md"}
      <Column sm={16} md={16} lg={4} class="problem-sidebar">
        <ProblemSidebarActions
          {claimable}
          {problem}
          status={problemStatus(problem)}
          {currentUserIsMaintainer}
        />
      </Column>
    {/if}
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
