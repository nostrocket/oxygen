<script>
  import "carbon-components-svelte/css/g100.css";
  import { Content, Grid, Row, Column, breakpointObserver } from "carbon-components-svelte";
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
  <meta
    name="description"
    content="Flamebucket - Relays that can take the heat"
  />
</svelte:head>


  <Header />

  <Content>
    <Grid fullWidth>
      <Row>
        <Column>
          <slot />
        </Column>
      </Row>
      <Row>
        <p>
          visit <a href="https://nostrocket.org">nostrocket.org</a> to learn more about
          Nostrocket
        </p>
      </Row>
    </Grid>
  </Content>
