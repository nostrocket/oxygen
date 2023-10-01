<script>
  import "carbon-components-svelte/css/g100.css";
  import { Content, Grid, Row, Column, breakpointObserver, Tile, ModalFooter } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import "./styles.css";
  import ndk from "$lib/stores/ndk";
  onMount(async () => {
    try {
      $ndk.connect().then(() => {
        console.log("NDK Connected!");
      });
    } catch (e) {
      console.error(`layout error`, e);
    }
  });
  let size = breakpointObserver()
  $: {
    console.log("breakpoint: "+$size)
  }
</script>

<svelte:head>
  <title>Nostrocket</title>
</svelte:head>


  <Header />

  <Content>
    <Grid fullWidth>
      <Row>
        <Column>
          <slot />
        </Column>
      
      </Row>
    </Grid>
    <Row>
      <Tile light style="width:100%; position:fixed; bottom:0;">
        <h6>Visit <a href="https://nostrocket.org">nostrocket.org</a> to learn more about Nostrocket</h6>
    </Tile>
    </Row>
</Content>