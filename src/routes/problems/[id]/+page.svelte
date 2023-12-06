<script lang="ts">
  import { page } from "$app/stores";
  import { makeHtml } from "$lib/helpers/mundane";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Breadcrumb,
    Column,
    Row,
    SkeletonText,
    Tile,
    breakpointObserver,
  } from "carbon-components-svelte";
  import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
  import ProblemSidebarActions from "../../../components/problems/ProblemSidebarActions.svelte";
  import ProblemStatusContainer from "../../../components/problems/ProblemStatusContainer.svelte";

  let problem: Problem | undefined;
  let claimable = false;

  let size = breakpointObserver();

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

    <ProblemSidebarActions
      {claimable}
      {problem}
      status={problemStatus(problem)}
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
