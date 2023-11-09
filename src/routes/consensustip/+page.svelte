<script lang="ts">
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import {
      Button,
      Row,
      Tile
    } from "carbon-components-svelte";
  import DeleteEvent from "../../components/modals/DeleteEvent.svelte";
  import { clone } from "$lib/helpers/mundane";

  </script>
  <Row>
    <Tile style="margin-bottom:1%;">
      <Button on:click={()=>{console.log($consensusTipState)}}>Print consensusTipState to console</Button>
    </Tile>
  </Row>
  <Row>
    <Tile style="margin-bottom:1%;">
      <Button on:click={()=>{console.log($consensusTipState.Copy())}}>Print clone of consensusTipState to console</Button>
    </Tile>
  </Row>
  <Row>
    <Tile style="margin-bottom:1%;">
      <DeleteEvent />
    </Tile>
  </Row>
  