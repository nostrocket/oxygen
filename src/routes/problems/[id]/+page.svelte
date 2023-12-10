<script lang="ts">
  import { page } from "$app/stores";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Accordion,
    Breadcrumb,
    Column,
    Row,
    SkeletonText,
    breakpointObserver,
  } from "carbon-components-svelte";
  import { writable } from "svelte/store";
  import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
  import ParentBox from "../../../components/problems/ParentBox.svelte";
  import ProblemComponent from "../../../components/problems/ProblemComponent.svelte";
  import ProblemDetail from "../../../components/problems/ProblemDetail.svelte";
  import ProblemSidebarActions from "../../../components/problems/ProblemSidebarActions.svelte";
  import { problemStatus } from "$lib/helpers/problem";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

  let currentUserIsMaintainer = false;

  let edit = false;
  let backupProblem: Problem;

  let statusErrorText: string | undefined = undefined;

  let rocket: Rocket | undefined;

  let activeProblem = writable<Problem>();

  $: problem = problem;

  $: {
    if ($currentUser && problem) {
      rocket = $consensusTipState.RocketMap.get(problem.Rocket);
      if (rocket?.Maintainers.has($currentUser?.pubkey)) {
        currentUserIsMaintainer = true;
      }
    }
  }

  $: {
    if ($page.params.id) {
      problem = $consensusTipState.Problems.get($page.params.id);
      if (problem) {
        console.log(problem.UID);
        $activeProblem = problem;
        claimable =
          !hasOpenChildren(problem, $consensusTipState) &&
          problem.Status == "open";

      }
    }
  }
</script>

{#if problem}
  <Row>
    <Column sm={16} md={16} lg={12} class="problem-content">
      <ParentBox {problem} />
      <ProblemDetail
        {currentUserIsMaintainer}
        {claimable}
        problem={activeProblem}
      />
      {#if problem.Children.size > 0}
        <Accordion size="sm">
          {#each problem.Children as child}
            <ProblemComponent
              dontShowExtraChildren
              problem={$consensusTipState.Problems.get(child)}
            />
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
          status={problemStatus(problem, $consensusTipState)}
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
