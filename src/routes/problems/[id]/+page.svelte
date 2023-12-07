<script lang="ts">
  import { page } from "$app/stores";
  import { makeHtml } from "$lib/helpers/mundane";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Breadcrumb,
    Button,
    ButtonSet,
    Column,
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
  import { Edit, TextItalic } from "carbon-icons-svelte";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { publishProblem } from "$lib/helpers/publishProblem";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

  let currentUserIsMaintainer = false;

  let canEdit = false;
  let edit = false;
  let backupProblem: Problem;

  $: {
    if ($currentUser && problem) {
      if (
        $consensusTipState.RocketMap.get(problem.Rocket)?.Maintainers.has(
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
    <Column sm={12} md={5} lg={9} class="problem-content">
      <div
        style={edit
          ? "padding:6px;border:solid;border-width:thin;border-color:DodgerBlue;"
          : ""}
      >
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
              <p>{problem?.Summary || ""}</p>
              {#if edit}<Tile light
                  ><TextArea bind:value={problem.Summary} /></Tile
                >{/if}
            </Tile>
          </Column>
        </Row>

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

    <ProblemSidebarActions
      {claimable}
      {problem}
      status={problemStatus(problem)}
      {currentUserIsMaintainer}
    />
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
