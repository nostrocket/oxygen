<script lang="ts">
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import {
      Button,
      Row,
      Tile
    } from "carbon-components-svelte";
  import DeleteEvent from "../../components/modals/DeleteEvent.svelte";

  </script>
  <Row>
    <Tile style="margin-bottom:1%;">
      <Button on:click={()=>{console.log($consensusTipState)}}>Print consensusTipState to console</Button>
    </Tile>
  </Row>
  <Row><DeleteEvent /></Row>
  