<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nameIsUnique } from "$lib/stores/nostrocket_state/hard_state/rockets";
  import { consensusTipState, nostrocketParticipants } from "$lib/stores/nostrocket_state/master_state";
  import { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { Button, Form, InlineNotification, Modal, Row, Select, SelectItem, SelectItemGroup, TextInput, Tile } from "carbon-components-svelte";
  import { Rocket as RocketIcon } from "carbon-icons-svelte";
  import { get } from "svelte/store";
  import { rocketNameValidator, simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import LogNewRootProblem from "../problems/LogNewRootProblem.svelte";
  import el from "date-fns/locale/el";

  let formOpen = false;
  //let rocketName = "";
  let formValidation = true;

  let disableButton = true;

  let nameError = "";
  let nameInvalid = true;

  let errorMessage = "";

  let thisUsersProblems:Problem[] = []

  function reset() {
    //rocketName = "";
    nameError = "";
    errorMessage = ""
  }

  export let existing:Rocket|undefined = undefined

  let rocketToPublish:Rocket = new Rocket()

  //let selected_problem:string|undefined = undefined

  $: {
    if (existing) {
      rocketToPublish = existing
    }
    disableButton = true;
    if (!$currentUser) {
      errorMessage = "You must login first";
    } else {
      if (existing) {
      if (existing.CreatedBy != $currentUser.pubkey) {
        //todo also allow if current user is a maintainer
        errorMessage = "only the rocket creator can modify it"
      }}
      if (!$nostrocketParticipants.includes($currentUser!.pubkey)) {
      errorMessage = "You must be in the Identity Tree to launch a new Rocket";
    } else {
      errorMessage = ""
      thisUsersProblems = []
      for (let [id, problem] of $consensusTipState.Problems) {
        if (problem.CreatedBy == $currentUser.pubkey && problem.Status == "open") {
          thisUsersProblems.push(problem)
        }
      }
    }
    
    if (!rocketNameValidator.test(rocketToPublish.Name) && !existing) {
      nameInvalid = true;
      nameError = "Rocket names MUST be 5-20 alphanumeric characters";
    } else if (!nameIsUnique(rocketToPublish.Name) && !existing) {
      nameInvalid = true;
      nameError = "Rocket names MUST be unique";
    } else {
      nameInvalid = false;
      nameError = "";
      if (get(currentUser)?.pubkey) {
        disableButton = false;
      }
    }

    } 

  }

  function onFormSubmit() {
    if (!disableButton) {
      let e = makeEvent({ kind: 1031 });
      e.tags.push(["t", rocketToPublish.Name, "name"]);
      if (rocketToPublish.ProblemID) {
        e.tags.push(["e", rocketToPublish.ProblemID, "problem"])
      }
      if (existing) {
        e.tags.push(["e", existing.UID, "rocket"])
      }
      if (!simulateEvents) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent());
            console.log("published to:", x);
            formOpen = false;
            reset();
          })
          .catch(() => console.log("failed to publish"));
      } else {
        console.log("simulation mode, not publishing events");
        e.sign().then(() => {
          console.log(e.rawEvent());
          formOpen = false;
          reset();
        });
      }
    }
  }

  function onFormOpen() {
    console.log(101)
    // Hack form assocation
    const modal = document.querySelector(".bx--modal");
    const form = modal.querySelector("form");
    const button = modal.querySelector(".bx--btn--primary");

    const id = "I" + Math.random().toString().substring(2);
    form.setAttribute("id", id);
    button.setAttribute("form", id);
    // Reverted by binding update on input change
    button.setAttribute("type", "submit");
  }
</script>

<Button
  icon={RocketIcon}
  on:click={() => {
    formOpen = true;
  }}>{#if existing}Modify this Rocket{:else}Launch a New Rocket Now{/if}</Button
>

<Modal
  bind:open={formOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText="Let's Fucking Go"
  secondaryButtonText="Cancel"
  primaryButtonIcon={RocketIcon}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Launch a New Rocket!"
  hasForm
  primaryButtonDisabled={disableButton}
  on:open={onFormOpen}
  on:click:button--secondary={() => (formOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
{#if errorMessage != ""}
<InlineNotification kind="warning" title="Warning:" subtitle={errorMessage} />
{#if !$currentUser}<LoginNip07Button />{/if}
{:else}
{#if thisUsersProblems.length == 0}
<InlineNotification kind="warning" title="Warning:" subtitle="a Rocket is created in response to a Problem, but you haven't logged any problems."/>
<LogNewRootProblem />
{:else}
<Tile light>
<h4>Step 0: Select the Problem this Rocket is solving</h4>
{#each thisUsersProblems as problem}
<Row>
  <Tile style="cursor:pointer" light={!(problem.UID == rocketToPublish.ProblemID)} on:click={()=>{rocketToPublish.ProblemID = problem.UID}}>
  {#if problem.UID == rocketToPublish.ProblemID}<RocketIcon /> {/if}{problem.Title}
</Tile>
</Row>
{/each}
</Tile>
{/if}

{/if}

  <Form on:submit={onFormSubmit}>
    {#if rocketToPublish.ProblemID}
    <br />
    <Tile light>
    <h4>Create a name for your Rocket</h4>
    <TextInput
      disabled={existing ? true : false}
      helperText="Use a name that describes the purpose of this new Rocket"
      invalid={nameInvalid}
      invalidText={nameError}
      labelText="Rocket Name"
      bind:value={rocketToPublish.Name}
      required
    />
  </Tile>
    {/if}
    
  </Form>
</Modal>

