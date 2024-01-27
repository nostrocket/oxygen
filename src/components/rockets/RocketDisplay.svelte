<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import makeEvent from "$lib/helpers/eventMaker";
  import { PublishProblem } from "$lib/helpers/problem";
  import { Create1031FromRocket } from "$lib/helpers/rockets";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    RecursiveIdentityList,
    consensusTipState,
  } from "$lib/stores/nostrocket_state/master_state";
  import {
    Problem,
    type Account,
    type Rocket,
  } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    Column,
    InlineNotification,
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import {
    ArrowRight,
    FaceDissatisfiedFilled,
    Send,
    XAxis
  } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import CommentUser from "../comments/CommentUser.svelte";
  import ProfileSmall from "../elements/ProfileSmall.svelte";
  import MissionText from "./MissionText.svelte";
  export let problem: Problem | undefined = undefined;
  export let rocket: Rocket | undefined = undefined;
  let maintainers: Account[] = [];

  let usersExistingProblems = derived(
    [currentUser, consensusTipState],
    ([$currentUser, $cts]) => {
      if ($currentUser && $cts) {
        let problems = new Set<Problem>();
        for (let [_, p] of $cts.Problems) {
          if (p.CreatedBy == $currentUser.pubkey && p.Status == "open") {
            problems.add(p);
          }
        }
        return [...problems];
      }
    }
  );

  let selectedProblem = "";

  let newProblem = new Problem();

  function logProblemAndAddToRocket(p: Problem) {
    if (!rocket) {
      throw new Error("could not get rocket");
    }
    if (!selectedParent) {
      throw new Error("no parent selected");
    }
    PublishProblem(newProblem, selectedParent, rocket).then((result) => {
      rocket!.ProblemID = result.id;
      let er = Create1031FromRocket(rocket!);
      er.publish().then(() => {
        goto(`${base}/${rocket?.Name}/info`);
      });
    });
  }

  async function Publish30617(url:URL) {
    if (!rocket) {throw new Error("no rocket found")}
    if (!problem) {throw new Error("no problem found")}
    if (!url) {throw new Error("no repo found")}
    let e = makeEvent({kind:30617, rocket:rocket?.UID})
    e.tags.push(["d", rocket.UID])
    e.tags.push(["name", rocket.Name])
    e.tags.push(["description", problem.Title])
    e.tags.push(["web", url.toString()])
    e.tags.push(["git", url.toString()+".git"])
    e.tags.push(["patches", "nostrocketpatches.nostr.me"])
    e.tags.push(["issues", "nostrocketrelay.nostr.me"])
    await e.publish()
  }

  function UpdateRocket() {
    if (!rocket) {
      throw new Error("no rocket found")
    }
    let er = Create1031FromRocket(rocket!);
      er.publish().then(() => {
        goto(`${base}/${rocket?.Name}/info`);
      });
  }

  let mission = "";
  let possibleParents = [
    "734f43e42ac0db49e0b5c16f16384a9cb3b061ba9afa4253873f4c999c802d4f",
    "62fc8db4ca49db5a403edca48033a77ff829f5c24a9efaf832208061cf0dd30c",
  ];

  let parents = derived(consensusTipState, ($cts) => {
    let problems: Problem[] = [];
    for (let id of possibleParents) {
      let p = $cts.Problems.get(id);
      if (p) {
        problems.push(p);
      }
    }
    return problems;
  });

  let selectedParent: Problem | undefined = undefined;

  $:repoInvalid = true;
  let gitRepo: string | undefined = undefined;
  $: {
    if (gitRepo) {
      try {
        let url = new URL(gitRepo);
        if (url) {
          repoInvalid = false;
        }
      } catch {
        repoInvalid = true;
      }
    }
  }
</script>

{#if rocket}
  <Row>
    <Tile>
      <Tile>
        <h3>THE PROBLEM:</h3>
        {#if problem}<h5
            style="cursor: pointer;"
            on:click={() => {
              goto(`${base}/${rocket?.Name}/problems/${problem?.UID}`);
            }}
          >
            {problem.Title}
          </h5>
          {#if problem.Summary}<p style="font-style: italic;">
              {problem.Summary}
            </p>{/if}
        {:else}
          <p>
            All Rockets begin with a problem to solve, but <CommentUser
              pubkey={rocket.CreatedBy}
            /> hasn't specified one yet.
          </p>
          {#if $currentUser?.pubkey == rocket.CreatedBy}
            <Tile light style="border:solid;">
              <h4>
                <ArrowRight /> TASK FOR <CommentUser
                  pubkey={rocket.CreatedBy}
                />
              </h4>
              <p>
                It's important to let potential contributors know what problem <span
                  style="font:400;">{rocket.Name}</span
                >
                is trying to solve.
              </p>
              {#if $usersExistingProblems}<Column
                  ><Row>
                    <h5>
                      {`Select the problem that ${rocket.Name} exists to solve`.toUpperCase()}
                    </h5>
                    <Row style="max-height:300px;overflow:scroll;">
                      {#each $usersExistingProblems as p}
                        <Tile
                          on:mouseleave={() => {
                            selectedProblem = "";
                          }}
                          on:click={() => {
                            selectedProblem = p.UID;
                          }}
                          style="cursor:pointer;margin:2px;max-width:400px;"
                          ><p>{p.Title}</p>
                          {#if selectedProblem == p.UID}<Button
                              style="float:right;"
                              size="small"
                              icon={Send}>PUBLISH</Button
                            >{/if}</Tile
                        >
                      {/each}
                    </Row></Row
                  ></Column
                >{/if}
              <h5>
                {$usersExistingProblems ? "OR " : ""}LOG A NEW PROBLEM NOW
              </h5>
              <Row>
                <Column
                  ><TextInput
                    style="margin-bottom:10px;"
                    bind:value={newProblem.Title}
                    maxlength={100}
                    placeholder="What problem are you trying to solve with {rocket.Name}?"
                  /></Column
                ></Row
              >
              {#if newProblem.Title.length > 0}
                <!-- <Tile><h4>{cleanProblemTitle(newProblem.Title)}</h4></Tile> -->
                <Row>
                  <Column
                    ><h5>SELECT A PARENT PROBLEM</h5>
                    <p>
                      Your problem will exist as a sub-problem of one of these.
                    </p>
                    <Row>
                      {#each $parents as p}
                        <Column
                          ><Tile
                            style={selectedParent?.UID == p.UID
                              ? "border:solid;"
                              : "margin:3px;"}
                            on:click={() => {
                              newProblem.Parents = new Set();
                              newProblem.Parents.add(p.UID);
                              selectedParent = p;
                            }}
                            ><h6>{p.Title}</h6>
                            <p>{p.Summary}</p></Tile
                          ></Column
                        >
                      {/each}
                    </Row></Column
                  >
                </Row>
                {#if newProblem.Title.length > 0}
                  <InlineNotification
                    kind="info-square"
                    lowContrast
                    title="GOOD TO KNOW"
                    subtitle="You can always change this information later"
                  />
                  <Tile
                    ><h4>
                      {#if selectedParent}{selectedParent.Title}<br /><span
                          style="margin-left:10px;"
                        /><XAxis />{/if}{newProblem.Title}
                    </h4>
                    <Button
                      disabled={!selectedParent || newProblem.Title.length == 0}
                      on:click={() => {
                        logProblemAndAddToRocket(newProblem);
                      }}
                      size="field"
                      icon={Send}>PUBLISH</Button
                    ></Tile
                  >
                {/if}
              {/if}
            </Tile>
          {/if}
        {/if}
      </Tile>

      <Tile>
        <h3>THE VISION:</h3>
        {#if rocket.Mission}
          <h6>{rocket.Mission}</h6>
        {:else}
          <p>
            Identifiying a problem to solve is a solid way to begin, but a great
            Rocket also provides a vision of what it will add to the world.
          </p>

          <p>
            <CommentUser pubkey={rocket.CreatedBy} /> hasn't created a vision for
            <span style="font-style:italic;">{rocket.Name}</span> yet.
          </p>
          {#if $currentUser?.pubkey == rocket.CreatedBy && rocket.ProblemID}
            <Tile light style="border:solid;">
              <h4>
                <ArrowRight /> TASK FOR <CommentUser
                  pubkey={rocket.CreatedBy}
                />
              </h4>
              <MissionText />
              <Row>
                <Column noGutterRight
                  ><TextInput
                    bind:value={mission}
                    maxlength={100}
                    placeholder=""
                  /></Column
                ><Column noGutterLeft
                  ><Button
                    on:click={() => {
                      if (!rocket) {
                        throw new Error("rocket not found");
                      }
                      rocket.Mission = mission;
                      let e = Create1031FromRocket(rocket);
                      e.publish();
                    }}
                    size="field"
                    icon={Send}>PUBLISH</Button
                  ></Column
                >
              </Row>
            </Tile>
          {/if}
        {/if}
      </Tile>

      <!-- {#if rocket.MeritMode}

      <h4>
        Consensus Mode: {rocket.MeritMode}
      </h4>{/if} -->
      <Tile>
        <ul>
          {#each rocket.Repositories as repo}<li>{repo}</li>{/each}
        </ul>
        {#if rocket.Repositories.size == 0}
          {rocket.Name} doesn't have any code. You cannot contribute to it unless
          <CommentUser pubkey={rocket.CreatedBy} /> adds at least one repo <FaceDissatisfiedFilled
          />.
          {#if $currentUser?.pubkey == rocket.CreatedBy && rocket.ProblemID && problem?.Parents}
            <Row
              ><Column
                ><Tile light style="border:solid;margin-top:10px">
                  <h4>
                    <ArrowRight /> TASK FOR <CommentUser
                      pubkey={rocket.CreatedBy}
                    />
                  </h4>
                  <h5>Create a new git repository</h5>
                  <p>This will create a DVM request for a new publicly accessible bare git repository which your pubkey (and {rocket.Name} maintainers) can push to.</p>
                  
                  <Tile><Button on:click={()=>{alert("COMING IN \"2 WEEKS\"")}} size="small" icon={Send}>PUBLISH DVM REQUEST</Button><h6 style="margin-top:10px;">DVM RESPONSES:</h6></Tile>
                  <hr />
                  <h5>Add an existing publicly accessible git repository to your Rocket</h5>
                  <p>If you use a repo URL, this will also create a NIP34 Repository Announcement event</p>
                  <TextInput
                    placeholder="Repo URL or NIP34 d tag"
                    bind:value={gitRepo}
                    style="margin-bottom:1%;"
                  /><Button
                  on:click={async () => {
                    let url = new URL(gitRepo);
                    rocket.Repositories.add(url);
                    await Publish30617(gitRepo)
                    UpdateRocket()
                  }}
                  size="field"
                  icon={Send}
                  disabled={repoInvalid}>PUBLISH</Button
                ></Tile
                ></Column
              ></Row
            >
          {/if}
        {/if}
      </Tile>

      <Tile>
        <h3>MAINTAINERS:</h3>
        <p>
          These people can merge pull requests, modify problems, and add new
          maintainers.
        </p>
        {#each RecursiveIdentityList(rocket.UID, rocket.CreatedBy, $consensusTipState, maintainers, "maintainers") as pubkey}<ProfileSmall
            {pubkey}
          />{/each}
      </Tile>
      {#if rocket.Events.size > 0}
        <Tile>
          <h3>HISTORY:</h3>
          <ul>
            {#each rocket.Events as event}
              <li>
                <a style="color:deeppink;" href="{base}/eventviewer/{event}"
                  >{event}</a
                >
              </li>
            {/each}
          </ul>
        </Tile>
      {/if}
    </Tile>
  </Row>
{/if}
