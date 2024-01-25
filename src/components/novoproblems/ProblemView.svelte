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
    TextInput,
    Tile,
    Truncate,
    UnorderedList,
  } from "carbon-components-svelte";
  import {
    Category,
    Chat,
    Edit,
    FolderOpen,
    FolderParent,
    Lightning,
    Send,
    XAxis,
    YAxis,
  } from "carbon-icons-svelte";
  import { derived, writable } from "svelte/store";
  import { rootProblem } from "../../settings";
  import CommentUser from "../comments/CommentUser.svelte";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import EventList from "../elements/EventList.svelte";
  import Profiles from "../elements/ProfileSmall.svelte";
  import RecursiveList from "../problems/RecursiveList.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  import StatusTag from "../tags/StatusTag.svelte";
  import ProblemBody from "./elements/ProblemBody.svelte";
  import Summary from "./elements/Summary.svelte";
  import Title from "./elements/Title.svelte";
  import Breadcrumb from "./elements/Breadcrumb.svelte";
  import { getFirstParent, getParents } from "./elements/helpers";

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

  let currentUserCanModify = derived(
    [currentUser, rocket, nostrocketMaintiners],
    ([$currentUser, $rocket, $nostrocketMaintainers]) => {
      if ($currentUser && $rocket && $nostrocketMaintainers) {
        if ($currentUser.pubkey == $rocket.CreatedBy) {
          return true;
        }
        if ($currentUser.pubkey == problem.CreatedBy) {
          return true;
        }
        if ($rocket.isMaintainer($currentUser.pubkey)) {
          return true;
        }
        if ($nostrocketMaintainers.includes($currentUser.pubkey)) {
          return true;
        }
      }
      return false;
    }
  );

  function PublishModification() {
    PublishProblem(problem, getParents(problem, $consensusTipState)!)
      .then((e) => {
        console.log(e);
        goto(`${base}/${$rocket?.Name}/problems/${problem.UID}`);
      })
      .catch((x) => {
        throw new Error(x);
      });
  }

  let newParent = "";
  let edit = false;

  $: firstParent = getFirstParent(problem, $consensusTipState);
  $: allParents = getParents(problem, $consensusTipState);
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
          }}
        ><FolderParent size={24}/></Button>{/if}

      <RocketTag rocket={getRocket(problem)} type="rocket-tag" />
      <StatusTag {problem} type="standard" />
      {#if problem.Children.size > 0}
        <Tag
          interactive
          type="purple"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=sub-problems`
            );
          }}><Category /> {problem.Children.size} sub-problems</Tag
        >
      {/if}
      {#if problem.TotalActivity() > 0}<Tag
          interactive
          type="cyan"
          icon={Chat}
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
          label="Problem"
        />
        <Tab
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=discussion`
            );
          }}
          label="Discussion [{problem.TotalActivity()}]"
          >Discussion <Tag size="sm">{problem.TotalActivity()}</Tag></Tab
        >
        <Tab
          label="Sub-Problems [{problem.FullChildren.size}]"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=sub-problems`
            );
          }}>Sub-Problems <Tag size="sm">{problem.FullChildren.size}</Tag></Tab
        >
        <Tab
          label="Pull Requests"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=pull-requests`
            );
          }}
        />
        <Tab
          label="Merits"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=merits`
            );
          }}>Merits <Tag size="sm">{$merits}</Tag></Tab
        >
        <Tab
          label="Actions"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=actions`
            );
          }}
        />
        <Tab
          label="Tools"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=tools`
            );
          }}
        />
        <Tab
          label="View in Tree"
          on:click={() => {
            goto(
              `${base}/${getRocket(problem)?.Name}/problems/${
                problem.UID
              }?tab=tree`
            );
          }}
        />
      </Tabs>
      <Row>
        <Column noGutter lg={16}>
          <Tile>
            <Row>
              <Column noGutterRight lg={12}
                ><Tile>
                  {#if $selectedTab == "problem"}
                    {#if problem.Summary}{#if problem.Summary.length > 0}
                        <Summary
                          publish={PublishModification}
                          {problem}
                          currentUserCanModify={$currentUserCanModify}
                        />{/if}{/if}
                    <ProblemBody
                      publish={PublishModification}
                      currentUserCanModify={$currentUserCanModify}
                      {problem}
                    />
                  {/if}
                  {#if $selectedTab == "sub-problems"}
                    {#each problem.FullChildren as child}
                      <Tile
                        light
                        style="margin-top:2px;cursor:pointer;"
                        on:click={() => {
                          goto(
                            `${base}/${getRocket(child)?.Name}/problems/${
                              child.UID
                            }`
                          );
                        }}
                        ><div style="display: inline-block;"><span><FolderOpen size={32} /></span><span style="position:relative;top:-8px;left:8px;font-size:medium;">{child.Title}</span></div></Tile
                      >
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
                  <!-- Parents -->
                  {#if allParents}
                    {#each allParents as parent}
                      <Tile light style="margin-top:2px;">
                        <div style="cursor:pointer;" on:click={() => {
                          goto(
                            `${base}/${getRocket(parent)?.Name}/problems/${
                              parent.UID
                            }`
                          );
                        }}><Truncate
                            ><FolderParent size={24} /> <span style="position:relative;top:-5px;">{parent.Title}</span></Truncate
                          ></div>
                        
                          {#if $currentUserCanModify}<Tile light style="margin:0;padding:0;"><Button
                              on:click={() => {
                                edit = true;
                              }}
                              kind="ghost"
                              icon={Edit}>CHANGE PARENT</Button
                            ></Tile>{/if}
                          {#if edit}
                            <TextInput placeholder="UID of new parent" bind:value={newParent} /><Button
                            icon={Send}
                              on:click={() => {
                                if (newParent.length != 64) {throw new Error("must be 64 hex chars")}
                                problem.Parents = new Set();
                                problem.Parents.add(newParent);
                                PublishModification();
                              }}>PUBLISH</Button
                            >{/if}
                            </Tile
                      >
                    {/each}
                  {/if}
                  <!-- Tags -->
                  <Tile light style="margin-top:2px;">
                    <RocketTag rocket={getRocket(problem)} type="rocket-tag" />
                    <StatusTag {problem} type="standard" />
                    {#if problem.Children.size > 0}
                      <Tag
                        interactive
                        type="purple"
                        on:click={() => {
                          goto(
                            `${base}/${getRocket(problem)?.Name}/problems/${
                              problem.UID
                            }?tab=sub-problems`
                          );
                        }}
                        ><Category /> {problem.Children.size} sub-problems</Tag
                      >
                    {/if}
                    {#if problem.TotalActivity() > 0}<Tag
                        interactive
                        type="cyan"
                        icon={Chat}
                        on:click={() => {
                          goto(
                            `${base}/${getRocket(problem)?.Name}/problems/${
                              problem.UID
                            }?tab=discussion`
                          );
                        }}>{problem.TotalActivity()} comments</Tag
                      >{/if}
                    <Tag type="high-contrast" icon={Lightning}>0 sats</Tag>
                  </Tile>
                  <Tile light style="margin-top:2px;">
                    {#each problem.Pubkeys as pubkey}<Profiles
                        {pubkey}
                      />{/each}
                  </Tile>
                </Tile></Column
              >
            </Row>
          </Tile>
        </Column>
      </Row>
    </Tile>
  </Tile>
</Row>
