<script>
  import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
  import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
  import State, { CurrentState } from "../lib/types.ts";
  import { initialState } from "$lib/state.ts";
  initialState();
  let idents = [];
  let fullIdent = {};
  $: if ($CurrentState.Identity) {
    console.log($CurrentState.Identity);
    idents = $CurrentState.Accounts;
    fullIdent = $CurrentState.Identity;
  }
</script>

<svelte:head>
  <title>FB</title>
  <meta
    name="description"
    content="Flamebucket - Relays that can take the heat"
  />
</svelte:head>

<section>
  <h1>Welcome to Nostrocket</h1>
  {#each idents as acc}
    <p>{fullIdent[acc].Name}</p>
  {/each}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }
</style>
