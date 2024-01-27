<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { PublishProblem } from "$lib/helpers/problem";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
  import { comments } from "$lib/stores/hot_resources/comments";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    consensusTipState,
    nostrocketMaintiners,
  } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import type {
    ExtendedBaseType,
    NDKEventStore,
  } from "@nostr-dev-kit/ndk-svelte";
  import {
    Button,
    Column,
    Row,
    Tab,
    Tabs,
    Tag,
    Tile,
    UnorderedList,
  } from "carbon-components-svelte";
  import {
    Add,
    AddAlt,
    ChatBot,
    Code,
    Construction,
    DataVis_3,
    FishMultiple,
    FolderOpen,
    FolderParent,
    Lightning,
    Tools,
    WatsonHealthAiResultsVeryHigh,
  } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import { rootProblem } from "../../settings";
  import CommentUser from "../comments/CommentUser.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import EventList from "../elements/EventList.svelte";
  import RecursiveList from "../problems/RecursiveList.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  import StatusTag from "../tags/StatusTag.svelte";
  import AddNewSubProblem from "./AddNewSubProblem.svelte";
  import SidePanel from "./SidePanel.svelte";
  import Breadcrumb from "./elements/Breadcrumb.svelte";
  import ChildProblemTile from "./elements/ChildProblemTile.svelte";
  import ProblemBody from "./elements/ProblemBody.svelte";
  import Summary from "./elements/Summary.svelte";
  import Title from "./elements/Title.svelte";
  import { CurrentUserCanModify, getFirstParent, getParents } from "./elements/helpers";

  export let problem: Problem;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(problem.Rocket);
  });

  let merits = derived(rocket, ($rocket) => {
    let total = 0;
    for (let [_, m] of $rocket?.Merits) {
      if (m.Problem == problem.UID) {
        total++;
      }
    }
    return total;
  });

  function getRocket(pr: Problem) {
    return $consensusTipState.RocketMap.get(pr.Rocket);
  }

  let selectedTab = derived(page, ($page) => {
    return $page.url.searchParams.get("tab") ?? "problem";
  });

  let selectedTabIndex = derived(selectedTab, ($selectedTab) => {
    switch ($selectedTab) {
      case "problem":
        return 0;
      case "discussion":
        return 1;
      case "sub-problems":
        return 2;
      case "pull-requests":
        return 3;
      case "merits":
        return 4;
      case "actions":
        return 5;
      case "tools":
        return 6;
      case "tree":
        return 7;
    }
  });
  let commentStore: NDKEventStore<ExtendedBaseType<NDKEvent>>;
  let subbed = new Set();
  $: {
    subToComments(problem, problem.UID).subscribe((c) => {
      for (let e of c) {
        if (!subbed.has(e.id)) {
          subbed.add(e.id);
          subToComments(problem, e.id);
        }
      }
    });
  }

  function subToComments(p: Problem, id: string) {
    commentStore = $ndk_profiles.storeSubscribe<NDKEvent>(
      { "#e": [id], kinds: [1] },
      { closeOnEose: true }
    );
    commentStore.subscribe((c) => {
      comments.update((co) => {
        for (let e of c) {
          p.Comments.add(e.id);
          co.set(e.id, e);
        }
        return co;
      });
    });
    return commentStore;
  }

  comments.subscribe((c) => {});

  let currentUserCanModify = CurrentUserCanModify(currentUser, rocket, nostrocketMaintiners, problem)

  function PublishModification(pr?: Problem) {
    let toPublish = problem;
    if (pr) {
      toPublish = pr;
    }
    PublishProblem(toPublish, getParents(toPublish, $consensusTipState)!)
      .then((e) => {
        console.log(e);
        goto(`${base}/${$rocket?.Name}/problems/${toPublish.UID ?? e.id}`);
      })
      .catch((x) => {
        throw new Error(x);
      });
  }
  $: firstParent = getFirstParent(problem, $consensusTipState);

  let childProblemFilter: string | undefined = undefined;
</script>

<Row>
  <Tile light style="width:100%;">
    <Breadcrumb problem={firstParent} state={$consensusTipState} />
    <Tile light style="border-bottom:solid;border-width:thin;"
      ><h2>
        <Title
          publish={PublishModification}
          {problem}
          currentUserCanModify={$currentUserCanModify}
        />
      </h2></Tile
    >
    <Tile light>
      {#if problem.Parents.size > 0}
        <Button
          iconDescription="parent"
          size="small"
          style="margin:2px;"
          kind="ghost"
          tooltipAlignment="start"
          on:click={() => {
            goto(
              `${base}/${getRocket(firstParent).Name}/problems/${
                firstParent.UID
              }`
            );
          }}><FolderParent size={24} /></Button
        >{/if}

      <RocketTag rocket={getRocket(problem)} type="rocket-tag" />
      <StatusTag {problem} type="standard" />
      {#if problem.FullChildren.size > 0}
        <Tag
          icon={FolderOpen}
          interactive
          type="purple"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=sub-problems`
            );
          }}>{problem.FullChildren.size} sub-problems</Tag
        >
      {/if}
      {#if problem.TotalActivity() > 0}<Tag
          interactive
          type="cyan"
          icon={ChatBot}
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=discussion`
            );
          }}>{problem.TotalActivity()} comments</Tag
        >{/if}
      <Tag type="high-contrast" icon={Lightning}>0 sats</Tag>
      <CommentUser pubkey={problem.CreatedBy} />
      <Button
        on:click={() => {
          goto(
            `${base}/${getRocket(problem)?.Name}/problems/${
              problem.UID
            }?tab=sub-problems`
          );
        }}
        kind="primary"
        icon={AddAlt}
        style="float:right;"
        size="small">NEW PROBLEM</Button
      >
    </Tile>
    <Tile light>
      <Tabs type="container" selected={$selectedTabIndex} autoWidth>
        <Tab
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=problem`
            );
          }}
          label="Problem"><WatsonHealthAiResultsVeryHigh /> Problem</Tab
        >
        <Tab
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=discussion`
            );
          }}
          label="Discussion [{problem.TotalActivity()}]"
          ><ChatBot /> Discussion <Tag size="sm">{problem.TotalActivity()}</Tag
          ></Tab
        >
        <Tab
          label="Sub-Problems [{problem.FullChildren.size}]"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=sub-problems`
            );
          }}
          ><FolderOpen /> Sub-Problems <Tag size="sm"
            >{problem.FullChildren.size}</Tag
          ></Tab
        >
        <Tab
          label="Patches"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=pull-requests`
            );
          }}><Code /> Patches</Tab
        >
        <Tab
          label="Merits"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=merits`
            );
          }}><FishMultiple /> Merits <Tag size="sm">{$merits}</Tag></Tab
        >
        <Tab
          label="Actions"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=actions`
            );
          }}><Construction /> Actions</Tab
        >
        <Tab
          label="Tools"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=tools`
            );
          }}><Tools /> Tools</Tab
        >
        <Tab
          label="View in Tree"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=tree`
            );
          }}><DataVis_3 /> View in Tree</Tab
        >
      </Tabs>
      <Row>
        <Column noGutter lg={16}>
          <Tile>
            <Row>
              <Column noGutterRight lg={12}
                ><Tile>
                  {#if $selectedTab == "problem"}
                    <Summary
                      publish={PublishModification}
                      {problem}
                      currentUserCanModify={$currentUserCanModify}
                    />
                    <ProblemBody
                      publish={PublishModification}
                      currentUserCanModify={$currentUserCanModify}
                      {problem}
                    />
                  {/if}
                  {#if $selectedTab == "sub-problems"}
                    <AddNewSubProblem
                      bind:value={childProblemFilter}
                      publish={PublishModification}
                      {problem}
                    />
                    {#each problem.FullChildren as child}
                      {#if childProblemFilter}{#if child.FullTextSearch(childProblemFilter) > 0.65}
                          <ChildProblemTile
                            problem={child}
                          />{/if}{:else if child.Status != "closed"}<ChildProblemTile
                          problem={child}
                        />{/if}
                    {/each}
                  {/if}

                  {#if $selectedTab == "discussion"}
                    //todo: show problem history within the conversation and add
                    to count (edits, claims, merits, etc)
                    <EventList eventList={problem.Events} />
                    <CommentsWrapper
                      {problem}
                      parentId={problem.UID}
                      isRoot={true}
                      bind:numberOfComments={problem.NumberOfComments}
                    />
                  {/if}

                  {#if $selectedTab == "tools"}
                    <Button
                      kind="ghost"
                      on:click={() => {
                        console.log(problem);
                      }}>PRINT TO CONSOLE</Button
                    >
                  {/if}

                  {#if $selectedTab == "tree"}
                    <UnorderedList>
                      <RecursiveList
                        problem={$consensusTipState.Problems.get(rootProblem)}
                      />
                    </UnorderedList>
                  {/if}
                </Tile></Column
              >
              <Column noGutterLeft lg={4}
                ><Tile>
                  <SidePanel
                    {problem}
                    publish={PublishModification}
                    currentUserCanModify={$currentUserCanModify}
                  />
                </Tile></Column
              >
            </Row>
          </Tile>
        </Column>
      </Row>
    </Tile>
  </Tile>
</Row>
