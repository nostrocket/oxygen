<script lang="ts">
  import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
  import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

  import { initialState } from "$lib/state";
  import ProductsForRocket from "$lib/components/ProductsForRocket.svelte";
  import State, { CurrentState } from "$lib/types.ts";
  // I dont know how to solve data sync between page so here we reload again
  initialState();
  let idents = [];
  let fullIdent = {};

  let rockets = {};

  $: if ($CurrentState.Rockets) {

	rockets = $CurrentState.Rockets;
  }

</script>

<div />

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">

  {#each  Object.values(rockets) as rocketInfo } 
		<ProductsForRocket rocketInfo={rocketInfo} />

	{/each}
</div>
