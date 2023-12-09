<script lang="ts">
  import { page } from "$app/stores";
  import { getDepthColor } from "$lib/helpers/ProblemDepthColor";
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
  import ParentBox from "../../../components/problems/ParentBox.svelte";
  import ProblemComponent from "../../../components/problems/ProblemComponent.svelte";
  import ProblemSidebarActions from "../../../components/problems/ProblemSidebarActions.svelte";
  import { writable } from "svelte/store";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

  let currentUserIsMaintainer = false;

  let canEdit = false;
  let edit = false;
  let backupProblem: Problem;

  let statusErrorText: string | undefined = undefined;

  let rocket: Rocket | undefined;

  let activeProblem = writable<Problem>()

  $:problem = problem

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
    if ($page.params.id) {
      problem = $consensusTipState.Problems.get($page.params.id);
    if (problem) {
      console.log(problem.UID)
      $activeProblem = problem
      claimable =
        !hasOpenChildren(problem, $consensusTipState) &&
        problem.Status == "open";
    }
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
    
    <Column sm={16} md={16} lg={12} class="problem-content" >
      <ParentBox {problem} />
      <Row style="margin-left:{problem.Depth}%;border-left: {getDepthColor(problem.Depth)} 4px solid;padding-left: 6px">
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
  </Row>
      {#if problem.Children.size > 0}
      <Accordion size="sm">
      {#each problem.Children as child} 
        <ProblemComponent dontShowExtraChildren depth={problem.Depth+1} problem={$consensusTipState.Problems.get(child)}/>
      {/each}
    </Accordion>
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
          problem={activeProblem}
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

<style>
  /* problem styles */
  .problem-title {
    font-size: 16px;
    font-weight: 300;
    margin: 0;
  }

  .problem-summary {
    opacity: 0.5;
    font-size: 14px;
    font-weight: 200;
    margin: 0;
  }

  .problem-description {
    opacity: 0.9;
    margin-bottom: 1rem;
  }

  /* give a solid background so we don't see other elements behind this one when zooming in on it. */
  :global(.bx--accordion__heading, .bx--accordion__content) {
    background-color: #161616;
  }

  :global(.problem .bx--accordion__content) {
    padding: 2rem 1rem;
  }

  :glolbal(.problem, .problem div) {
    background-color: #161616;
  }

  :global(.problem .problem *) {
    transition: all 250ms ease-in-out;
    transform-style: preserve-3d;
    perspective: 1000px;
    will-change: transform;
  }

  :global(.problem > button) {
    border-left: var(--depthColor) 4px solid;
    border-bottom: transparent 0px solid;
  }

  /* when a problem is clicked, it becomes focused */
  :global(.focus-problem) {
    box-shadow: 0 0 50px #000, 0 0 50px #000; /*, 0 0 50px #000, 0 0 50px #000;*/
    transition: all 250ms ease-in-out;
    margin: 2rem 0;
  }

  :global(.focus-problem > button) {
    border-left: transparent 0px solid;
    border-bottom: var(--depthColor) 4px solid;
    transition: all 250ms ease-in-out;
    transform: perspective(1000px) translateZ(50px);
    position: relative;
    z-index: 999;
  }

  /* prevent white outline box when focused */
  :global(.problem .bx--accordion__heading:focus::before) {
    border: none;
  }
</style>
