<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    consensusTipState,
    mempool,
    rebroadcastEvents,
  } from "$lib/stores/nostrocket_state/master_state";
  import { NDKRelaySet, type NDKEvent } from "@nostr-dev-kit/ndk";
  import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
  import { Mutex } from "async-mutex";
  import { Button, Row, Tile } from "carbon-components-svelte";
  import DeleteEvent from "../../components/modals/DeleteEvent.svelte";
  import { ndk, ndk_profiles } from "$lib/stores/event_sources/relays/ndk";

  let sendMutex = new Mutex();
  function onFormSubmit() {
    $mempool.forEach((ev) => {
      if (ev.kind == 15172008 && ev.pubkey == $currentUser?.pubkey) {
        let e = makeEvent({ kind: 5 });
        e.tags.push(["e", ev.id]);
        e.publish();
      }
    });
  }
  let published = new Set<string>()
  function republishAllMyEvents() {
    if ($currentUser) {
      let allMyEvents = $ndk_profiles.storeSubscribe<NDKEvent>(
        { authors: [$currentUser!.pubkey], kinds: [1] },
        { closeOnEose: true }
      );
      const publish: NDKSvelte = new NDKSvelte({
        explicitRelayUrls: ["wss://relay.sovereignengineering.io"], //"ws://127.0.0.1:6969", "wss://nostr.688.org"
      });
      
      (async () => {
        try {
          await publish.connect();
          console.log("publish connected");
          allMyEvents.subscribe((x) => {
            x.forEach((e) => {
              if (!published.has(e.id)) {
                published.add(e.id)
                sendMutex.acquire().then(()=>{
                e.ndk = publish;
              e.publish().then(x=>{console.log(x)}).finally(()=>{
                sendMutex.release()
              });
              })
              }
            });
          });
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }
</script>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        console.log($consensusTipState);
      }}>Print consensusTipState to console</Button
    >
  </Tile>
</Row>
<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        console.log($consensusTipState.Copy());
      }}>Print clone of consensusTipState to console</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <DeleteEvent type="consensus" />
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        onFormSubmit();
      }}>Delete all consensus events</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        rebroadcastEvents(sendMutex);
      }}>Republish events in current state to all relays</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        republishAllMyEvents();
      }}>Republish my events</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        let e = makeEvent({kind:6969})
        e.publish(NDKRelaySet.fromRelayUrls(["ws://127.0.0.1:6969"], $ndk)).then(r=>{
          console.log(r)
        })
      }}>Test 688.org</Button
    >
  </Tile>
</Row>