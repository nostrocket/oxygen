<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nameIsUnique } from "$lib/stores/nostrocket_state/hard_state/rockets";
  import {
    consensusTipState,
    nostrocketParticipants,
  } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    InlineLoading,
    InlineNotification,
    TextInput,
    Tile,
    Toggle,
  } from "carbon-components-svelte";
  import { rocketNameValidator, simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import MissionText from "./MissionText.svelte";
  import ProblemSelector from "./ProblemSelector.svelte";
  import RocketDisplay from "./RocketDisplay.svelte";
  import { Create1031FromRocket } from "$lib/helpers/rockets";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  export let existing: Rocket | undefined = undefined;

  let disabled: boolean = true;

  let nameError = "";
  let nameInvalid = false;
  let newName: string | undefined = undefined;
  let namePopulated: boolean = false;

  $: {
    if (existing?.Name && !newName && !namePopulated) {
      newName = existing.Name;
      namePopulated = true;
    }
  }

  $: {
    if (newName && existing) {
      if (newName != existing.Name) {
        if (!rocketNameValidator.test(newName)) {
          nameInvalid = true;
          nameError = "Rocket names MUST be 5-20 alphanumeric characters";
        } else if (!nameIsUnique(newName)) {
          console.log(43, newName);
          nameInvalid = true;
          nameError = "Rocket names MUST be unique";
        } else {
          console.log(46);
          nameInvalid = false;
          nameError = "";
          disabled = false;
        }
      }
    }
  }

  let errorMessage: string | undefined = undefined;
  let SelectedProblem: Problem | undefined;
  let dictatorMode: boolean = false;
  let populatedMeritMode = false;
  $: {
    if (existing) {
      if (
        !dictatorMode &&
        existing?.MeritMode == "dictator" &&
        !populatedMeritMode
      ) {
        dictatorMode = true;
        populatedMeritMode = true;
      }
      if (populatedMeritMode && !dictatorMode) {
        existing.MeritMode = "pleb";
      }
    }
  }

  let repoInvalid = true;
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

  $: {
    if (existing) {
      if (!SelectedProblem) {
        SelectedProblem = $consensusTipState.Problems.get(existing.ProblemID);
      }
      if (SelectedProblem) {
        if (existing.ProblemID != SelectedProblem.UID) {
          existing.ProblemID = SelectedProblem.UID
        }
      }

      if (!$currentUser) {
        errorMessage = "You must login first";
      } else {
        if (!$nostrocketParticipants.includes($currentUser!.pubkey)) {
          errorMessage = "You must be in the Identity Tree";
        } else if ($currentUser.pubkey != existing.CreatedBy) {
          errorMessage =
            "You must be the Rocket's creator or a Maintainer to modify it";
        } else {
          errorMessage = undefined;
        }
      }
    }
  }
</script>

{#if !existing}<InlineLoading description="waiting for rocket data" />{/if}

{#if existing}
  <RocketDisplay problem={SelectedProblem} rocket={existing} />

  {#if errorMessage}<InlineNotification
      kind="error"
      lowContrast
      title="WARNING"
      subtitle={errorMessage}
    />{/if}
  {#if !$currentUser}
    <LoginNip07Button />
  {/if}

  <hr />
  <h4>Change the Problem for this Rocket</h4>
  <ProblemSelector
    dropdown
    bind:Selected={SelectedProblem}
    state={$consensusTipState}
  />
  <hr />
  <h4>The Heart of Your Rocket's Community</h4>
  <MissionText />
  <TextInput
    labelText="Enter your Mission here"
    placeholder="Tell potential contributors what you're fighting for"
    maxlength={70}
    bind:value={existing.Mission}
    required
    style="margin-bottom:1%;"
  />
  <hr />
  {#if existing.MeritMode == "dictator"}
    <h4>Convert this Rocket to Pleb mode?</h4>
    <p>
      This rocket is currently in Dictator mode, you must pay contributors to
      work on this Rocket.
    </p>
    <p>You turn off Dictator mode here</p>
    <Toggle bind:toggled={dictatorMode} />
  {/if}
  <h4>Git Repositories</h4>
  <p>
    When people log problems under this Rocket, they will be able to tag the
    applicable repository
  </p>
  {#each existing.Repositories as repo}
    <Tile
      ><h5>{repo.toString()}</h5>
      <Button
        on:click={() => {
          existing.Repositories.delete(repo);
          existing = existing;
        }}
        size="field"
        kind="danger">REMOVE THIS REPO</Button
      >
    </Tile>
  {/each}
  <h4>Add a repo</h4>
  <TextInput
    placeholder="Repo URL [OPTIONAL]"
    bind:value={gitRepo}
    style="margin-bottom:1%;"
  />
  <Button
    on:click={() => {
      let url = new URL(gitRepo);
      existing.Repositories.add(url);
      existing = existing;
    }}
    size="small"
    disabled={repoInvalid}>Add Repo</Button
  >
  <hr />

  <h4>Rocket Name</h4>
  <p>
    Modifying this will break existing direct hyperlinks to your Rocket, and
    other people will be able to use the old name
  </p>
  <TextInput
    invalid={nameInvalid}
    invalidText={nameError}
    placeholder="Rocket Name"
    bind:value={newName}
    style="margin-bottom:1%;"
  />
  <Button
    disabled={nameInvalid}
    on:click={() => {
      existing.Name = newName;
    }}>Claim {newName}</Button
  >

  <hr />
  <Button
    on:click={() => {
      if (existing) {
        let e = Create1031FromRocket(existing);
        if (!simulateEvents) {
          e.publish().then((x) => {
            console.log(e.rawEvent());
            console.log("published to:", x);
            goto(`${base}/rockets/${existing.UID}`);
          });
        }
      }
    }}>PUBLISH</Button
  >
{/if}