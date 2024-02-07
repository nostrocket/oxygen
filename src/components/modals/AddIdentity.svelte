<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
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
  import { onMount } from "svelte";
  import { derived, writable, type Readable } from "svelte/store";
  import {
    hexPubkeyValidator,
    nostrocketIgnitionEvent,
    nostrocketIgnitionTag,
    simulateEvents
  } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import Profile from "../elements/Profile.svelte";
  import CommentUser from "../comments/CommentUser.svelte";

  export let type = "participants"

  let profileName:string|undefined = undefined;

  let listOfCurrentPeople: Readable<string[]> = nostrocketParticipants

  let buttonDisabled = true;
  let currentUserIsInTree = false;
  let requestedUserIsNotInTree:boolean = false;
  //let rocketObject:Rocket| undefined = undefined;

  let rocketObjectStore = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(nostrocketIgnitionEvent)
  })
  //let user:NDKUser|undefined = undefined

  //const profileData = writable<NDKUser | undefined>(undefined);

  // function getProfile(pubkey: string) {
  //   if (pubkey.length == 64) {
  //     user = $ndk_profiles.getUser({ hexpubkey: pubkey });
  //     user.fetchProfile().then((profile) => {
  //       if (user?.profile) {
  //         profileData.set(user);
  //       }

  //     });
  //   }
  // }

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

  let existingStateBackup = [
  "c8383d81dd24406745b68409be40d6721c301029464067fcc50a25ddf9139549",
  "e8ed3798c6ffebffa08501ac39e271662bfd160f688f94c45d692d8767dd345a",
  "cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb",
  "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322",
  "3492dd43d496a237f4441fd801f5078b63542c3e158ffea903cb020a1af4ffdd",
  "652d58acafa105af8475c0fe8029a52e7ddbc337b2bd9c98bb17a111dc4cde60",
  "95a69326449931adda32e7e0f6275bec0e387abeee4bb56b3e94f46a6ac402e2",
  "00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700",
  "c5fb6ecc876e0458e3eca9918e370cbcd376901c58460512fe537a46e58c38bb",
  "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
  "c80b5248fbe8f392bc3ba45091fb4e6e2b5872387601bf90f53992366b30d720",
  "7b1589d7c04f1c555e6fd84024637ac95ceb4853e1fcfbb1bb823c8b2cfd64fc",
  "ee6cd7fd534667b7aacaaa7411dea425c0b5bf0e4b6be0e808fabac650bf237c",
  "659505becda938dafde592af9b5a4f2ac23e70a1dc2f3148e8239dcc31e9c054",
  "deba262b2d87f7ed1252241e607bd1bbf42e67354992f89e7536d65d7a19e423",
  "e25a8b2051022a08f97d267d4b99ddfc500a0bfe149a5f671e46f72e9ea36ec9",
  "38fe7b2b5215e40a79568920588b5886d6217a43570c28c0a32e36b1222e901e",
  "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
  "06639a386c9c1014217622ccbcf40908c4f1a0c33e23f8d6d68f4abf655f8f71",
  "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",
  "56d5de36eb4fed1e2fe99bfbfdea10ab5fa630a13c59d2e3c70dbb5b3988a572",
  "9bc2d34ddda83d942a1fdd36a7487f9aaec740db24ea79732d90e383d19d2948",
  "17538dc2a62769d09443f18c37cbe358fab5bbf981173542aa7c5ff171ed77c4",
  "21c9656c867febac6011ae7b3738f92069e3747598111464c159b1216e2fc961",
  "d12c4697332c1e7043c17dbc8391d70630b198f2eb8f7343597e8ba38ac21182",
  "df56b7c6a3d12ef1569f3c3a3704ac2e19faf65839891edd5b14aed12318d202",
  "84d26cfbad4acb37a1fb8ebc2eb6e8286c130863a8995897773fb6bda2c08107",
  "b4f36e2a63792324a92f3b7d973fcc33eaa7720aaeee71729ac74d7ba7677675",
  "71df211931d26ee41121d295bd43cbc7e382505e333b5c13d4016ced9542d9d7",
  //npub1ynpa8pjgnavltqq6tq8mhrnx4swsqsek2wlrylmrw6543vcgks2qaxtuuf
  //npub149p5act9a5qm9p47elp8w8h3wpwn2d7s2xecw2ygnrxqp4wgsklq9g722q
]
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
  primaryButtonText={profileName
    ? "I think " + profileName + " is alright"
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