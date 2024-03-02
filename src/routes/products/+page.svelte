<script lang="ts">
	import Summary from './../../components/novoproblems/elements/Summary.svelte';
	import Title from './../../components/novoproblems/elements/Title.svelte';
  import { profiles } from "$lib/stores/hot_resources/profiles";
  import { requestProvider } from "webln";
  import {
    consensusTipState,
    mempool,
  } from "$lib/stores/nostrocket_state/master_state";
  import {
    Button,
    Column,
    InlineNotification,
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { Rocket } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import CommentUser from "../../components/comments/CommentUser.svelte";
  import {
    ZAPS_ENABLED,
    nostrocketIgnitionEvent,
    rocketNameValidator,
    rootProblem,
  } from "../../settings";
  import { ndk } from "$lib/stores/event_sources/relays/ndk";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { currentUser } from "$lib/stores/hot_resources/current-user";

  let event = derived(mempool, ($mempool) => {
    return $mempool.get(
      "dee9df90e1ae4bae4ba372d29590905d1e5c5047389062df6b15924dc1cab400"
    );
  });

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(
      "dee9df90e1ae4bae4ba372d29590905d1e5c5047389062df6b15924dc1cab400"
    );
  });

  let profile = derived(
    [event, rocket, profiles],
    ([$event, $rocket, $profiles]) => {
      if ($event && $rocket && $profiles) {
        return $profiles.get($rocket.CreatedBy);
      }
    }
  );

  let repoName: string | undefined = undefined;
  let requested = false;

  async function zap() {
    if ($event && $profile && $rocket && $ndk.signer) {
      let invoice = await $event.zap(
        6969000,
        "ghole",
        [
          [
            "e",
            "dee9df90e1ae4bae4ba372d29590905d1e5c5047389062df6b15924dc1cab400",
          ],
        ],
        $profile,
        $ndk.signer
      );
      if (invoice) {
        const webln = await requestProvider();
        let response = await webln.sendPayment(invoice!);
        if (response) {
          if (response.preimage) {
            createRepo()
          }
        }
        // TODO we should check here if the payment was successful, with a timer
        // that is canceled here; if the timer doesn't come back, show the modal again
        // or instruct the user to do something with the failed payment
      }
    }
  }

  async function checkName(name:string) {
    const response = await fetch(
      "https://g-hole.nostrocket.org/checkname/"+name
      //"http://test-api.ghole.xyz/check_name?repo_name="+name
    );
    const _json = await response.json()
    if (_json) {
      nameOK = true
      nameError = ""
    } else {
      nameError = name + " is taken"
    }
  }

  async function createRepo() {
    let npub = $currentUser?.npub
    if (!npub) {
      throw new Error("npub not found")
    }
    const response = await fetch("https://g-hole.nostrocket.org/new", {
      method: "POST",
      body: JSON.stringify({
        "user_npub": npub,
        "repo_name": repoName,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    let j = await response.json()
    if (j) {
      created = true
    } else {
      throw new Error("something went wrong")
    }
  }

  let nameOK = false;
  let nameError = "Please enter a name";

  function nameValidator() {
    if (repoName) {
      if (rocketNameValidator.test(repoName)){
        nameError = ""
    } else {
      nameOK = false
      nameError = "Repo names MUST be 5-20 alphanumeric characters"
    }
    }

  }

  let created = false;
</script>

<h2>Nostrocket Products</h2>

<Tile
  ><p>
    Rockets should ultimately produce products/services that people want to pay
    for.
  </p>
</Tile>
{#if $rocket}
  <Tile light style="margin-top:2px">
    <Row
      ><Column
        ><h3>G-Hole: one push away from world domination</h3>
        <p>What you get:</p>
        <ul>
          <li>A public git repository to use as the home for your project</li>
          <li>Use all your existing git tooling and workflow</li>
          <li>No passwords, just your nostr identity</li>
          <li>Add maintainers simply by adding their npubs</li>
          <li>Interoperable with any NIP34 client</li>
          <li>
            ZERO exit costs - migrate to your own server at any time. All the
            comments etc are on nostr.
          </li>
        </ul></Column
      ><Column
        ><img style="margin:10px" src="/img/r.jpg" width="300px" /></Column
      ></Row
    >
    <InlineNotification lowContrast title="Support" kind="info-square" subtitle="Contact gsovereignty on nostr if something goes wrong or you need help."></InlineNotification>
    {#if created}
    <Tile style="margin-top:2px">
      <h3>{repoName} is currently being provisioned</h3>
      <p>Please add <code>relay.nostrocket.org</code> to your relay set and check your DMs, you'll recieve a DM when provisioning is complete!</p>
    </Tile>
    {/if}
    {#if !created}
    {#if requested}<TextInput on:keyup={nameValidator} bind:value={repoName} invalid={!nameOK} invalidText={nameError} disabled={(requested && repoName && nameOK)} ></TextInput>{/if}

    <Button
      disabled={!event || !$rocket || !$profile || (requested && !repoName) || !$currentUser}
      on:click={() => {
        if (!ZAPS_ENABLED) {
          alert("coming soon");
        } else {
          if (!repoName) {
            requested = true;
          }
          if (requested && repoName && !nameOK) {
            //check if name is available
            checkName(repoName)
          }
          if (requested && repoName && nameOK) {
              zap();
            }
        }
      }}
      icon={Rocket}
      >{#if requested}{#if !repoName}Enter Name{:else if !nameOK}CHECK NAME{:else if nameOK}ZAP NOW TO CLAIM {repoName}{/if}{:else}BUY NOW{/if}</Button
    >
    {/if}
  </Tile>
{/if}

<style>
  h3 {
    margin-bottom: 10px;
  }
  li {
    margin-top: 10px;
  }
  ul {
    list-style-position: inside;
    line-height: 140%;
    list-style-type: square;
    margin: 1%;
    font-size: 12pt;
  }
</style>
