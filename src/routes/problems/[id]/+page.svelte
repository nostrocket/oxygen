<script lang="ts">
  import { page } from "$app/stores";
  import { makeHtml } from "$lib/helpers/mundane";
  import { publishProblem } from "$lib/helpers/publishProblem";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Accordion,
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
    breakpointObserver
  } from "carbon-components-svelte";
  import { Edit } from "carbon-icons-svelte";
  import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
  import Contributing from "../../../components/problems/Contributing.svelte";
  import ProblemSidebarActions from "../../../components/problems/ProblemSidebarActions.svelte";
  import ProblemComponent from "../../../components/problems/ProblemComponent.svelte";
  import ParentBox from "../../../components/problems/ParentBox.svelte";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

  let currentUserIsMaintainer = false;

  let canEdit = false;
  let edit = false;
  let backupProblem: Problem;

  let statusErrorText: string | undefined = undefined;

  let rocket: Rocket | undefined;

  $: {
    if ($currentUser && problem) {
      rocket = $consensusTipState.RocketMap.get(problem.Rocket);
      if (rocket?.Maintainers.has($currentUser?.pubkey)) {
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
            <ParentBox {problem} />
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
          <Contributing {rocket} {problem} />
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

      {#if problem.Children.size > 0}
      <Tile>
        <h4>CHILD PROBLEMS UNDER THIS ONE</h4>
        <br />
      <Accordion size="sm">
      {#each problem.Children as child} 
        <ProblemComponent dontShowExtraChildren depth={0} problem={$consensusTipState.Problems.get(child)}/>
      {/each}
    </Accordion>
  </Tile>
      {/if}

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

