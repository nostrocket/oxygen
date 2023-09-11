<script>
  import { identitiesInTree, testEvents2 } from "$lib/state";
  import ndk from "$lib/stores/ndk";
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";



	// import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
	// import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
	// //import {CurrentState, State} from "../lib/state.ts";

	// const ndk = new NDKSvelte({
	// 	explicitRelayUrls: [
	// 		// "ws://localhost:8080",
	// 		// "wss://nos.lol",
	// 		// "wss://relay.snort.social",
	// 		// "wss://relay.damus.io",
	// 		// "wss://relay.nostr.band",
	// 			"wss://nostr.688.org",
	// 	],
	// });

	// ndk.connect()
	// 		.then(() => console.log("NDK Connected"))
	// 		.catch((error) => console.error("NDK connection failed", error));

	// const stateEvents = ndk.storeSubscribe(
	// 		{ kinds: [10311]},
	// 		{ closeOnEose: false }
	// );
	// $: {
	// 	$stateEvents.forEach((event) => {
	// 		//console.log(event)
	// 		let stateFromEvent = new State(event.content)
	// 		CurrentState.update(existing => {
	// 			return stateFromEvent
	// 		})
	// 		//console.log(stateFromEvent)
	// 	})
	// }
	// let idents = [];
	// let fullIdent = {}
	// $: if($CurrentState.Identity) {
	// 	console.log($CurrentState.Identity)
	// 	idents = $CurrentState.Accounts
	// 	fullIdent = $CurrentState.Identity
	// 	// for (let key in $CurrentState.Identity) {
	// 	//     let value = $CurrentState.Identity[key];
	// 	//     console.log(key + ":" + value.Name)
	// 	// }

	// }
</script>

<svelte:head>
	<title>FB</title>
	<meta name="description" content="Flamebucket - Relays that can take the heat" />
</svelte:head>

<section>
	<h1>
		Welcome to the Nostrocket Identity Tree
	</h1>
	<!-- {#each $testEvents2 as event }
		<p>{event.id}</p>
	{/each} -->
	{#each $identitiesInTree as ident }
	<Avatar ndk={$ndk} pubkey={ident.Account} class="profile" />
	<p>{ident.Name}</p>
{/each}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
