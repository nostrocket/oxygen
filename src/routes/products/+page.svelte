<script lang="ts">
  import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
  import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

  import { initialState } from "$lib/state";
  import ProductsForRocket from "$lib/components/ProductsForRocket.svelte";
  import State, { CurrentState } from "$lib/types.ts";
  // import type { Rocket, RocketID } from "$lib/types"
  // i dont know how to solve data sync between page so here we reload again
  initialState();
  let idents = [];
  let fullIdent = {};

  let rockets;

  $: if ($CurrentState.Rockets) {
    console.log($CurrentState.Rockets, "sssssssssssssssssssssssss");
    rockets = $CurrentState.Rockets;
  }

  // console.log(rockets);
</script>

<div />

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  {console.log(rockets, "sdsd")}
  <!-- {#each Object.values(rockets) as rocket }
		<ProductsForRocket rocketInfo={rocket} />
	{/each} -->
</div>
