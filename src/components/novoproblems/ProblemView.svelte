<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Column,
    Row,
    Tab,
    Tabs,
    Tag,
    Tile,
  } from "carbon-components-svelte";
  import { Category, Chat, Lightning, XAxis, YAxis } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import CommentsWrapper from "../comments/CommentsWrapper.svelte";
  import RocketTag from "../tags/RocketTag.svelte";
  import StatusTag from "../tags/StatusTag.svelte";
  import ProblemBody from "./ProblemBody.svelte";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import type {
    NDKEventStore,
    ExtendedBaseType,
  } from "@nostr-dev-kit/ndk-svelte";
  import { comments } from "$lib/stores/hot_resources/comments";
  import Profiles from "./ProfileSmall.svelte";

  export let problem: Problem;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(problem.Rocket);
  });

  function getRocket(pr: Problem) {
    return $consensusTipState.RocketMap.get(pr.Rocket);
  }

  function getParents(pr: Problem) {
    let parentSet = new Set<Problem>();
    for (let p of pr.Parents) {
      let parentProblem = $consensusTipState.Problems.get(p);
      if (parentProblem) {
        parentSet.add(parentProblem);
      }
    }
    return [...parentSet];
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
</script>

<!-- <Breadcrumb noTrailingSlash>
  <BreadcrumbItem>Home</BreadcrumbItem>
  <BreadcrumbItem>Rockets</BreadcrumbItem>
  <BreadcrumbItem>{getRocket(problem)?.Name}</BreadcrumbItem>
  <BreadcrumbItem>Problems</BreadcrumbItem>
  <BreadcrumbItem>{problem.UID}</BreadcrumbItem>
</Breadcrumb> -->
<Row>
  <Tile light style="width:100%;">
    <h3>{problem.Title}</h3>
    <p>{problem.Summary}</p>
    <hr />
    <Row>
      <Column noGutterRight lg={12}>
        <Tabs selected={$selectedTabIndex} autoWidth>
          <Tab
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=problem`);
            }}
            label="Problem"
          />
          <Tab
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=discussion`);
            }}
            label="Discussion"
          />
          <Tab
            label="Sub-Problems"
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=sub-problems`);
            }}
          />
          <Tab
            label="Pull Requests"
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=pull-requests`);
            }}
          />
          <Tab
            label="Merits"
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=merits`);
            }}
          />
          <Tab
            label="Tools"
            on:click={() => {
              goto(`${base}/problems/${problem.UID}?tab=tools`);
            }}
          />
        </Tabs>
        {#if $selectedTab == "problem"}
          {#if problem.FullText.length == 0}<h5>
              There's no description for this problem yet! Want to <a href="#"
                >add it now</a
              >?
            </h5>{/if}
          <ProblemBody {problem} />
        {/if}
        {#if $selectedTab == "sub-problems"}
          {#each problem.FullChildren as child}
            <Tile
              style="margin-top:2px;cursor:pointer;"
              on:click={() => {
                goto(`${base}/problems/${child.UID}`);
              }}><XAxis />{child.Title}</Tile
            >
          {/each}
        {/if}

        {#if $selectedTab == "discussion"}
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
      </Column>
      <Column noGutter lg={4}>
        <Tile light>
          <!-- Parents -->

          {#each getParents(problem) as parent}
            <Tile style="margin-top:2px;">
              <span
                style="cursor:pointer;font-weight:300;"
                on:click={() => {
                  goto(`${base}/problems/${parent.UID}`);
                }}><YAxis /> {parent.Title}</span
              >

              <!-- <Tag style="display:inline-block;float:right;" size="sm"
              ><ParentChild />{p.Children.size}</Tag> -->
            </Tile>
          {/each}

          <!-- Tags -->
          <Tile style="margin-top:2px;">
            <RocketTag rocket={getRocket(problem)} type="rocket-tag" />
            <StatusTag {problem} type="standard" />
            {#if problem.Children.size > 0}
              <Tag interactive
                type="purple"
                on:click={() => {
                  goto(`${base}/problems/${problem.UID}?tab=sub-problems`);
                }}><Category /> {problem.Children.size} sub-problems</Tag
              >
            {/if}
            {#if problem.Comments.size > 0}<Tag
                interactive
                type="cyan"
                icon={Chat}
                on:click={() => {
                  goto(`${base}/problems/${problem.UID}?tab=discussion`);
                }}>{problem.Comments.size} comments</Tag
              >{/if}
            <Tag type="high-contrast" icon={Lightning}>0 sats</Tag>
          </Tile>
          <Tile style="margin-top:2px;">
            {#each problem.Pubkeys as pubkey}<Profiles {pubkey} />{/each}
            
          </Tile>
        </Tile>
      </Column></Row
    ></Tile
  >
</Row>
