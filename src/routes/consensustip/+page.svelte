<script lang="ts">
  import { consensusTipState, rebroadcastEvents } from "$lib/stores/nostrocket_state/master_state";
  import { Button, Row, Tile } from "carbon-components-svelte";
  import DeleteEvent from "../../components/modals/DeleteEvent.svelte";
  import { clone } from "$lib/helpers/mundane";
  import { Mutex } from "async-mutex";

  let sendMutex = new Mutex()

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
    <Button on:click={()=>{rebroadcastEvents(sendMutex)}}>Republish events in current state to all relays</Button>
  </Tile>
</Row>
