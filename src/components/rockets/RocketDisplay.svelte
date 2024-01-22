<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
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
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import {
    ArrowRight,
    FaceDissatisfiedFilled,
    SendAlt,
  } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import { NewRocketProblem } from "../../settings";
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
    let parent = $consensusTipState.Problems.get(NewRocketProblem);
    if (!parent) {
      throw new Error("could not get parent");
    }
    if (!rocket) {
      throw new Error("could not get rocket");
    }
    PublishProblem(newProblem, parent, rocket).then((result) => {
      rocket!.ProblemID = result.id;
      let er = Create1031FromRocket(rocket!);
      er.publish().then((er_result) => {
        goto(`${base}/${rocket?.Name}/problems/${result.id}`);
      });
    });
  }

  let mission = ""

</script>

{#if rocket}
  <Row>
    <Tile>
      <Tile>
        <h3>THE PROBLEM:</h3>
        {#if problem}<h5>{problem.Title}</h5>
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
                It's important to let potential contributors know what problem {rocket.Name}
                is trying to solve. Log a new problem now:
              </p>
              <Row>
                <Column noGutterRight
                  ><TextInput
                    bind:value={newProblem.Title}
                    maxlength={100}
                    placeholder="What problem are you trying to solve?"
                  /></Column
                ><Column noGutterLeft
                  ><Button
                    on:click={() => {
                      logProblemAndAddToRocket(newProblem);
                    }}
                    size="field"
                    icon={SendAlt}>PUBLISH</Button
                  ></Column
                >
              </Row>

              {#if $usersExistingProblems}<Column
                  ><Row>
                    <p>
                      Or select an existing problem that you have logged
                      previously:
                    </p>
                    <Row>
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
                              icon={SendAlt}>PUBLISH</Button
                            >{/if}</Tile
                        >
                      {/each}</Row
                    ></Row
                  ></Column
                >{/if}
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
            Identifiying a problem to solve is a great start, but Rockets can
            also add an additional booster by providing a vision of what this
            rocket might build. <CommentUser pubkey={rocket.CreatedBy} /> hasn't
            created a vision for {rocket.Name} yet.
          </p>
          {#if $currentUser?.pubkey == rocket.CreatedBy && rocket.ProblemID}
            <Tile light style="border:solid;">
              <h4>
                <ArrowRight /> TASK FOR <CommentUser
                  pubkey={rocket.CreatedBy}
                />
              </h4>
              <p>
                Tell potential contributors what {rocket.Name}
                is going to create in the world.
              </p>
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
                      if (!rocket) {throw new Error("rocket not found")}
                      rocket.Mission = mission;
                      let e = Create1031FromRocket(rocket)
                      e.publish()
                    }}
                    size="field"
                    icon={SendAlt}>PUBLISH</Button
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
        <h3>REPOSITORIES:</h3>
        <ul>
          {#each rocket.Repositories as repo}<li>{repo}</li>{/each}
        </ul>
        {#if rocket.Repositories.size == 0}
          This Rocket doesn't have any code. You cannot contribute to it unless
          the creator adds at least one repo <FaceDissatisfiedFilled />.
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
