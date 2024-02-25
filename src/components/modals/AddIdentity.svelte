<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState, nostrocketMaintiners, nostrocketParticipants } from "$lib/stores/nostrocket_state/master_state";
  import {
    Button,
    Column,
    Form,
    InlineNotification,
    Loading,
    Modal,
    Row,
    TextInput,
  } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";
  import { nip19 } from "nostr-tools";
  import { onMount } from "svelte";
  import { derived, type Readable } from "svelte/store";
  import {
    hexPubkeyValidator,
    nostrocketIgnitionEvent,
    nostrocketIgnitionTag,
    simulateEvents
  } from "../../settings";
  import CommentUser from "../comments/CommentUser.svelte";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";

  export let type = "participants"

  let profileName:string|undefined = undefined;

  let listOfCurrentPeople: Readable<string[]> = nostrocketParticipants

  let buttonDisabled = true;
  let currentUserIsInTree = false;
  let requestedUserIsNotInTree:boolean = false;

  let rocketObjectStore = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(nostrocketIgnitionEvent)
  })
  
  onMount(()=>{
    if ($currentUser) {
      console.log("current user:", $currentUser?.pubkey)
    }
    if (type == "maintainers") {
      listOfCurrentPeople = nostrocketMaintiners
    }
  })

  $: {
    if (type == "maintainers") {
      listOfCurrentPeople = nostrocketMaintiners
    }
    
    if ($rocketObjectStore && $currentUser && currentUserIsInTree) {
      if (type == "maintainers") {
        requestedUserIsNotInTree = !$rocketObjectStore!.isMaintainer(pubkey);
        currentUserIsInTree = $rocketObjectStore!.isMaintainer($currentUser!.pubkey)
      }
      if (type == "participants") {
        requestedUserIsNotInTree = !$rocketObjectStore!.isParticipant(pubkey);
        currentUserIsInTree = $rocketObjectStore!.isParticipant($currentUser!.pubkey)
      }
    }
    if ($currentUser && $rocketObjectStore) {
      if (type == "maintainers") {
        currentUserIsInTree = $rocketObjectStore!.isMaintainer($currentUser!.pubkey)
      }
      if (type == "participants") {
        currentUserIsInTree = $rocketObjectStore!.isParticipant($currentUser!.pubkey)
      }
    } else {
      currentUserIsInTree = false;
    }

    if (
          profileName &&
          currentUserIsInTree &&
          requestedUserIsNotInTree
        ) {
          buttonDisabled = false;
        }

        if (!$rocketObjectStore) {
          buttonDisabled = true
        }
  }

  // $: {
  //   if ($currentUser?.pubkey == ignitionPubkey) {
  //     buttonDisabled = false;
  //   }
  // }

  let formOpen = false;
  let pubkey = "";
  let formValidation = true;

  let nameError = "";
  let nameInvalid = false;

  function reset() {
    pubkey = "";
    nameError = "";
  }

  function validate() {
    if (pubkey.startsWith("npub1")) {
      let hex = nip19.decode(pubkey).data.toString();
      if (hex.length != 64) {
        nameInvalid = true;
        nameError = "Must be a valid pubkey";
        buttonDisabled = true;
      }
      if (hex.length == 64) {
        pubkey = hex;
        nameInvalid = false;
        nameError = "";
        //getProfile(pubkey);
      }
      //get hex pubkey from npub, or return error
    } else if (!hexPubkeyValidator.test(pubkey)) {
      nameInvalid = true;
      nameError = "Must be a valid pubkey";
      buttonDisabled = true;
    } else {
      nameInvalid = false;
      nameError = "";
      //getProfile(pubkey);
    }
  }

  function onFormSubmit() {
    let e = makeEvent({ kind: 1592, rocket: nostrocketIgnitionTag });
    if (type == "participants") {e.tags.push(["d", nostrocketIgnitionEvent])}
    if (type == "maintainers") {e.tags.push(["d", nostrocketIgnitionEvent + "m"])}
     //an alternative here would be to let the user select the rocket they want to add someone to
    //for each tag in the existing set, push each
    if (!$currentUser?.pubkey) {
      throw new Error("you MUST be signed in to do this");
    }
    // for (let p of existingStateBackup) {
    //     e.tags.push(p);
    //   }
    if ($currentUser?.pubkey) {
      if (type == "maintainers") {
        let listOfExistingMaintainersForUser = $rocketObjectStore?.Maintainers.get($currentUser?.pubkey)
        if (listOfExistingMaintainersForUser) {
          for (let pk of listOfExistingMaintainersForUser) {
            e.tags.push(["p", pk, "maintainers"]);
      }
        }
      }
      if (type == "participants") {
        let list = $rocketObjectStore?.Participants.get($currentUser?.pubkey)
        if (list) {
          for (let pk of list) {
            e.tags.push(["p", pk, "identity"]);
      }
        }

      }

    }
    //push the new tag
    if (pubkey) {
      if (type == "maintainers") {e.tags.push(["p", pubkey, "maintainer"]);}
      if (type == "participants") {e.tags.push(["p", pubkey, "identity"]);}
      
    }
    if (!simulateEvents) {
      e.publish()
        .then((x) => {
          console.log(e.rawEvent());
          console.log("published to:", x);
          formOpen = false;
          reset();
        })
        .catch(() => alert("failed to publish"));
    } else {
      e.sign().then(() => {
        console.log(e.rawEvent());
        formOpen = false;
        reset();
      });
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
  size="small"
  icon={User}
  on:click={() => {
    formOpen = true;
  }}>Add someone now</Button
>

<Modal
  bind:open={formOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText={profileName
    ? "I think " + profileName + " is alright"
    : "Waiting for profile data"}
  secondaryButtonText="Cancel"
  primaryButtonIcon={User}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Add someone to the Web of Trust"
  hasForm
  primaryButtonDisabled={buttonDisabled}
  on:open={onFormOpen}
  on:click:button--secondary={() => (formOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
  <p>
    To include someone in the Nostrocket Web of Trust, paste their pubkey below, and
    confirm to the rest of the community that you have interacted with this
    person and you think they're alright (not a bad actor, spammer etc).
  </p>
  <br /><br />
  <Form on:submit={onFormSubmit}>
    {#if !$currentUser}
      <Row>
        <LoginNip07Button />
      </Row>
    {:else if !currentUserIsInTree}
      <InlineNotification
        title="Error"
        subtitle="You MUST be in the Identity Tree to add someone to it!"
      />
    {/if}
    <TextInput
      invalid={nameInvalid}
      invalidText={nameError}
      on:keyup={validate}
      on:change={validate}
      labelText="Pubkey (HEX or npub)"
      bind:value={pubkey}
      required
    />
    {#if buttonDisabled}<p>
        <Loading withOverlay={false} small />Waiting for profile
      </p>{/if}
    {#if pubkey}<Column><CommentUser bind:profileName {pubkey} /></Column><Column
        >{#if $listOfCurrentPeople.includes(pubkey)}<InlineNotification
            title="Error"
            subtitle="You cannot add someone who has already been added"
          />{console.log($listOfCurrentPeople)}{/if}</Column
      >{/if}
  </Form>
</Modal>