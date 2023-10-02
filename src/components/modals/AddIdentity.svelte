<script lang="ts">
  import { unixTimeNow } from '$lib/helpers/mundane';
  import { rootTag, rocketNameValidator, simulate, hexPubkeyValidator, nostrocketIgnitionEvent, nostrocketIgnitionTag } from '$lib/settings';
  import ndk from '$lib/stores/ndk';
  import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
  import NostrEvent from '@nostr-dev-kit/ndk';
  import { currentUser } from "$lib/stores/current-user";
import { Header, Content, TextInput, Button, Modal, Form } from 'carbon-components-svelte';
import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
  import LoginNip07Button from '../LoginNIP07Button.svelte';
  import { BitcoinTipHeight } from '$lib/helpers/bitcoin';
let formOpen = false;
let pubkey = '';
let formValidation = true;

let nameError = "";
let nameInvalid = false;

function reset() {
	pubkey = '';
	nameError = "";
}

function validate() {
	if (!hexPubkeyValidator.test(pubkey)) {
        nameInvalid = true
        nameError = "A hex pubkey MUST be 64 chars"
    } else {
        nameInvalid = false
        nameError = ""
    }
}

function onFormSubmit() {
		let e = new NDKEvent($ndk)
		e.kind = 30000;
		e.created_at = unixTimeNow()
		e.tags.push(rootTag)
		e.tags.push(nostrocketIgnitionTag)
		e.tags.push(["d", nostrocketIgnitionEvent])
		e.tags.push(["h", BitcoinTipHeight().toString()])
		//todo for each tag in the existing set, push each
		e.tags.push(["p", pubkey])
		if (!simulate) {
			e.publish().then(x=>{
			console.log(e.rawEvent())
			console.log("published to:", x)
			formOpen = false;
			reset()
		}).catch(()=>alert("failed to publish"))
		} else {
			e.sign().then(()=>{
				console.log(e.rawEvent())
				formOpen = false;
				reset()
			})
		}
	}
	
	function onFormOpen() {
		// Hack form assocation
		const modal = document.querySelector('.bx--modal');
		const form = modal.querySelector('form');
		const button = modal.querySelector('.bx--btn--primary');
		
		const id = 'I' + Math.random().toString().substring(2);
		form.setAttribute('id', id);
		button.setAttribute('form', id);
		// Reverted by binding update on input change
		button.setAttribute('type', 'submit');
	}
</script>

<Button icon={User} on:click={() => {formOpen = true}}>Add someone to the Identity Tree</Button>


<Modal bind:open={formOpen} shouldSubmitOnEnter={false}
			 primaryButtonText="Let's Fucking Go" secondaryButtonText="Cancel"
             primaryButtonIcon={User}
			 selectorPrimaryFocus=".bx--text-input"
			 modalHeading="Add someone to the Identity Tree"
			 hasForm
			 on:open={onFormOpen}
  		     on:click:button--secondary={() => formOpen = false}
             on:submit={() => formValidation ? onFormSubmit() : null}
             >
	<Form on:submit={onFormSubmit}>
		{#if !$currentUser}
		<LoginNip07Button />
		{/if}
		<TextInput helperText="Paste the person't pubkey in hex format" invalid={nameInvalid} invalidText={nameError} on:keyup={validate} on:change={validate} labelText="Pubkey (HEX)" bind:value={pubkey} required/>
	</Form>
</Modal>