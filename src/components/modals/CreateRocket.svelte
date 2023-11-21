<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nameIsUnique } from "$lib/stores/nostrocket_state/hard_state/rockets";
  import { consensusTipState, nostrocketParticipants } from "$lib/stores/nostrocket_state/master_state";
  import { Button, Form, Modal, Select, SelectItem, SelectItemGroup, TextInput } from "carbon-components-svelte";
  import { get } from "svelte/store";
  import { rocketNameValidator, simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import { Rocket as RocketIcon} from "carbon-icons-svelte";
  import { Rocket } from "$lib/stores/nostrocket_state/types";

  let formOpen = false;
  //let rocketName = "";
  let formValidation = true;

  let disableButton = true;

  let nameError = "";
  let nameInvalid = true;

  function reset() {
    //rocketName = "";
    nameError = "";
  }

  export let existing:Rocket|undefined = undefined

  let rocketToPublish:Rocket = new Rocket()

  //let selected_problem:string|undefined = undefined

  $: {
    if (existing) {
      rocketToPublish = existing
    }
    disableButton = true;
    if (!$currentUser?.pubkey) {
      nameError = "You must login first";
    } else {
      if (existing) {
      if (existing.CreatedBy != $currentUser.pubkey) {
        //todo also allow if current user is a maintainer
        nameError = "only the rocket creator can modify it"
      }}
      if (!$nostrocketParticipants.includes($currentUser!.pubkey)) {
      nameError = "You must be in the Identity Tree to launch a new Rocket";
    } else if (!rocketNameValidator.test(rocketToPublish.Name) && !existing) {
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
  <Form on:submit={onFormSubmit}>
    {#if !$currentUser}
      <LoginNip07Button />
    {/if}
    <TextInput
      disabled={existing ? true : false}
      helperText="Use a name that describes the purpose of this new Rocket"
      invalid={nameInvalid}
      invalidText={nameError}
      labelText="Rocket Name"
      bind:value={rocketToPublish.Name}
      required
    />
    <Select hideLabel size="xl" labelText="Status" bind:selected={rocketToPublish.ProblemID} fullWidth>
      <SelectItemGroup label="SELECT THE PROBLEM THAT THIS ROCKET SHOULD SOLVE">
        {#each $consensusTipState.Problems as [key, r]} 
        {#if r.CreatedBy == $currentUser?.pubkey && r.Status == "open"}<SelectItem value={key} text={r.Title} />{/if}
          
        {/each}
      </SelectItemGroup>
    </Select>
  </Form>
</Modal>

