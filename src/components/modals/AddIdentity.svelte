<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState, nostrocketMaintiners, nostrocketParticipants } from "$lib/stores/nostrocket_state/master_state";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
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
  import { get, writable, type Readable } from "svelte/store";
  import {
    hexPubkeyValidator,
    ignitionPubkey,
    nostrocketIgnitionEvent,
    nostrocketIgnitionTag,
    simulateEvents,
  } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import Profile from "../elements/Profile.svelte";
  import { onMount } from "svelte";
  import type { Rocket } from "$lib/stores/nostrocket_state/types";

  export let type = "participants"

  let listOfCurrentPeople: Readable<string[]> = nostrocketParticipants

  let buttonDisabled = true;
  let currentUserIsInTree = false;
  let requestedUserIsNotInTree:boolean = false;
  let rocketObject:Rocket| undefined = undefined;

  const profileData = writable<NDKUser | undefined>(undefined);
  const _ndk_profiles = get(ndk_profiles);

  function getProfile(pubkey: string) {
    if (pubkey.length == 64) {
      let user = $ndk_profiles.getUser({ hexpubkey: pubkey });
      user.fetchProfile().then((profile) => {
        if (user.profile) {
          profileData.set(user);
        }
        if (
          user.profile &&
          currentUserIsInTree &&
          requestedUserIsNotInTree
        ) {
          buttonDisabled = false;
        }
      });
    }
  }

  onMount(()=>{
    console.log($currentUser?.pubkey)
    if (type == "maintainers") {
      listOfCurrentPeople = nostrocketMaintiners
    }
  })

  $: {
    console.log(type)
    if (type == "maintainers") {
      listOfCurrentPeople = nostrocketMaintiners
    }
    rocketObject = $consensusTipState.RocketMap.get(nostrocketIgnitionEvent)
    if ($currentUser && currentUserIsInTree && $profileData?.pubkey == pubkey) {
      if (type == "maintainers") {
        requestedUserIsNotInTree = !rocketObject!.isMaintainer(pubkey);
        currentUserIsInTree = rocketObject!.isMaintainer($currentUser!.pubkey)
      }
      if (type == "participants") {
        requestedUserIsNotInTree = !rocketObject!.isParticipant(pubkey);
        currentUserIsInTree = rocketObject!.isParticipant($currentUser!.pubkey)
      }
    }
    if ($currentUser) {
      if (type == "maintainers") {
        currentUserIsInTree = rocketObject!.isMaintainer($currentUser!.pubkey)
      }
      if (type == "participants") {
        currentUserIsInTree = rocketObject!.isParticipant($currentUser!.pubkey)
      }
    } else {
      currentUserIsInTree = false;
    }
  }

  $: {
    if ($currentUser?.pubkey == ignitionPubkey) {
      buttonDisabled = false;
    }
  }

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
        getProfile(pubkey);
      }
      //get hex pubkey from npub, or return error
    } else if (!hexPubkeyValidator.test(pubkey)) {
      nameInvalid = true;
      nameError = "Must be a valid pubkey";
      buttonDisabled = true;
    } else {
      nameInvalid = false;
      nameError = "";
      getProfile(pubkey);
    }
  }

  function onFormSubmit() {
    let e = makeEvent({ kind: 31009, rocket: nostrocketIgnitionTag });
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
        for (let pk of rocketObject!.Maintainers.get($currentUser!.pubkey)) {
        e.tags.push(["p", pk, "maintainers"]);
      }
      }
      if (type == "participants") {
        for (let pk of rocketObject!.Participants.get($currentUser!.pubkey)) {
        e.tags.push(["p", pk, "identity"]);
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

  let existingStateBackup = [
    [
      "p",
      "c8383d81dd24406745b68409be40d6721c301029464067fcc50a25ddf9139549",
      "identity",
    ],
    [
      "p",
      "e8ed3798c6ffebffa08501ac39e271662bfd160f688f94c45d692d8767dd345a",
      "identity",
    ],
    [
      "p",
      "cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb",
      "identity",
    ],
    [
      "p",
      "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322",
      "identity",
    ],
    [
      "p",
      "3492dd43d496a237f4441fd801f5078b63542c3e158ffea903cb020a1af4ffdd",
      "identity",
    ],
    [
      "p",
      "652d58acafa105af8475c0fe8029a52e7ddbc337b2bd9c98bb17a111dc4cde60",
      "identity",
    ],
    [
      "p",
      "95a69326449931adda32e7e0f6275bec0e387abeee4bb56b3e94f46a6ac402e2",
      "identity",
    ],
    [
      "p",
      "00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700",
      "identity",
    ],
    [
      "p",
      "c5fb6ecc876e0458e3eca9918e370cbcd376901c58460512fe537a46e58c38bb",
      "identity",
    ],
    [
      "p",
      "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
      "identity",
    ],
    [
      "p",
      "c80b5248fbe8f392bc3ba45091fb4e6e2b5872387601bf90f53992366b30d720",
      "identity",
    ],
    [
      "p",
      "7b1589d7c04f1c555e6fd84024637ac95ceb4853e1fcfbb1bb823c8b2cfd64fc",
      "identity",
    ],
    [
      "p",
      "ee6cd7fd534667b7aacaaa7411dea425c0b5bf0e4b6be0e808fabac650bf237c",
      "identity",
    ],
    [
      "p",
      "659505becda938dafde592af9b5a4f2ac23e70a1dc2f3148e8239dcc31e9c054",
      "identity",
    ],
    [
      "p",
      "deba262b2d87f7ed1252241e607bd1bbf42e67354992f89e7536d65d7a19e423",
      "identity",
    ],
    [
      "p",
      "e25a8b2051022a08f97d267d4b99ddfc500a0bfe149a5f671e46f72e9ea36ec9",
      "identity",
    ],
  ];
</script>

<Button
  size="small"
  icon={User}
  on:click={() => {
    formOpen = true;
  }}>Add someone to the {#if type=="participants"}Particpant{/if}{#if type=="maintainers"}Maintainer{/if} Tree</Button
>

<Modal
  bind:open={formOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText={$profileData?.profile?.name
    ? "I think " + $profileData.profile?.name.toUpperCase() + " is alright"
    : "Waiting for profile data"}
  secondaryButtonText="Cancel"
  primaryButtonIcon={User}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Add someone to the Identity Tree"
  hasForm
  primaryButtonDisabled={buttonDisabled}
  on:open={onFormOpen}
  on:click:button--secondary={() => (formOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
  <p>
    To include someone in the Identity Tree, paste their pubkey below, and
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
      helperText="Paste the person't pubkey in hex format"
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
    {#if $profileData}<Column><Profile profile={$profileData} /></Column><Column
        >{#if $listOfCurrentPeople.includes(pubkey)}<InlineNotification
            title="Error"
            subtitle="You cannot add someone who has already been added"
          />{console.log($listOfCurrentPeople)}{/if}</Column
      >{/if}
  </Form> 
</Modal>
