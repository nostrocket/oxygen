<script>
  import { Button, Tile } from "carbon-components-svelte";
  import { Rocket } from "carbon-icons-svelte";

</script>

<h2>Nostrocket Products</h2>
<Tile
  ><p>
    Rockets should ultimately produce products/services that people want to pay
    for.
  </p>
</Tile>
<Tile light style="margin-top:2px">
  <h3>GitRocket: one push away from world domination</h3>
  <p>What you get:</p>
  <ul>
    <li>A public git repository to use as the home for your project</li>
    <li>Use all your existing git tooling and workflow</li>
    <li>No passwords, just your nostr identity</li>
    <li>Add maintainers simply by publishing their npubs</li>
    <li>inter-operability with any NIP34 client</li>
    <li>Zero exit costs, migrate to your own server at any time</li>
  </ul>
  <Button on:click={()=>{alert("coming soon")}} icon={Rocket}>BUY NOW</Button>
</Tile>

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
    list-style-type:square;
    margin: 1%;
    font-size: 12pt;
  }
</style>
