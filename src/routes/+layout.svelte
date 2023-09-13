<script>
  import "carbon-components-svelte/css/g100.css";
  import { Content, Grid, Row, Column } from "carbon-components-svelte";
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
</script>

<svelte:head>
  <title>Nostrocket</title>
  <meta
    name="description"
    content="Flamebucket - Relays that can take the heat"
  />
</svelte:head>

<div class="app">
  <Header />

  <Content>
    <Grid fullWidth>
      <Row>
        <Column>
          <slot />
        </Column>
      </Row>
    </Grid>
  </Content>

  <footer>
    <p>
      visit <a href="https://nostrocket.org">nostrocket.org</a> to learn more about
      Nostrocket
    </p>
  </footer>
</div>

<style>
  /* .app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	} */

  /* @media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	} */
</style>
