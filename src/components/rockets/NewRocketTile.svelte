<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    Button,
    Column,
    InlineNotification,
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { Rocket as RocketIcon, SendFilled } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import { nostrocketIgnitionEvent, rocketNameValidator } from "../../settings";
  import { nameIsUnique } from "$lib/stores/nostrocket_state/hard_state/rockets";
  import LoginButtonWithError from "../elements/LoginButtonWithError.svelte";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { derived } from "svelte/store";
  import { Rocket } from "$lib/stores/nostrocket_state/types";
  import { Create1031FromRocket } from "$lib/helpers/rockets";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  $: nameInvalid = false;
  $: nameError = "";
  let newRocket = new Rocket();

  $: {
    if (newRocket.Name) {
      if (!rocketNameValidator.test(newRocket.Name)) {
        nameInvalid = true;
        nameError = "Rocket names MUST be 5-20 alphanumeric characters";
      } else if (!nameIsUnique(newRocket.Name)) {
        nameInvalid = true;
        nameError = "Rocket names MUST be unique";
      } else {
        nameInvalid = false;
        nameError = "";
      }
    }
  }

  let nostrocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(nostrocketIgnitionEvent);
  });

  let currentUserIsInTree = derived(
    [nostrocket, currentUser],
    ([$nr, $currentUser]) => {
      if ($currentUser && $nr) {
        return $nr.isParticipant($currentUser.pubkey);
      }
      return false;
    }
  );

  function publishNewRocket(r: Rocket) {
    let e = Create1031FromRocket(r);
    e.publish()
      .then((result) => {
        console.log(result);
        goto(`${base}/${r.Name}`)
      })
      .catch((error) => {
        console.log(error);
      });
  }
</script>

<Tile style="margin-top:6px;">
  <Column lg={8}>
    <h4>Launch a new Rocket</h4>
    <Row
      ><Column noGutterRight
        ><TextInput
          placeholder="Name Your Rocket!"
          invalid={nameInvalid}
          invalidText={nameError}
          bind:value={newRocket.Name}
        /></Column
      ><Column noGutterLeft
        ><Button
          disabled={nameInvalid || !$currentUserIsInTree}
          icon={SendFilled}
          size="field"
          on:click={() => {
            publishNewRocket(newRocket);
          }}>PUBLISH</Button
        ></Column
      ></Row
    ></Column
  >
  <Row>
    <Column lg={5}
      ><Tile>
        {#if newRocket.Name.length > 0}<h3>{newRocket.Name}</h3>
          {#if $currentUser}<CommentUser pubkey={$currentUser?.pubkey} />{/if}
          <LoginButtonWithError />
          {#if !$currentUserIsInTree}<InlineNotification
          style="cursor:pointer"
          on:click={()=>{goto(`${base}/identity/`)}}
              lowContrast
              kind="warning"
              title="NOTICE"
              subtitle="You must be in the Identity Tree to create a new Rocket!"
            />{/if}
        {/if}
      </Tile>
    </Column>
  </Row>
</Tile>
