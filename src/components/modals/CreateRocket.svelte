<script lang="ts">
  import { unixTimeNow } from '$lib/helpers/mundane';
  import { ignitionTag, simulate } from '$lib/settings';
  import ndk from '$lib/stores/ndk';
  import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
  import NostrEvent from '@nostr-dev-kit/ndk';
  import { currentUser } from "$lib/stores/current-user";
import { Header, Content, TextInput, Button, Modal, Form } from 'carbon-components-svelte';
import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
  import LoginNip07Button from '../LoginNIP07Button.svelte';
let formOpen = false;
let rocketName = '';
let formValidation = true;

let nameError = "";
let nameInvalid = false;
let nameRegex = /^\w{5,20}$/

function reset() {
	rocketName = '';
	nameError = "";
}

function validate() {
    if (!nameRegex.test(rocketName)) {
        nameInvalid = true
        nameError = "Rocket names MUST be 5-20 alphanumeric characters"
    } else {
        //todo validate name is unique
        nameInvalid = false
        nameError = ""
    }

}

function onFormSubmit() {
		let e = new NDKEvent($ndk)
		e.kind = 15171031;
		e.created_at = unixTimeNow()
		e.tags.push(ignitionTag)
		e.tags.push(["n", rocketName])
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

<Button icon={Rocket} on:click={() => {formOpen = true}}>Launch a New Rocket Now</Button>


<Modal bind:open={formOpen} shouldSubmitOnEnter={false}
			 primaryButtonText="Let's Fucking Go" secondaryButtonText="Cancel"
             primaryButtonIcon={Rocket}
			 selectorPrimaryFocus=".bx--text-input"
			 modalHeading="Launch a New Rocket!"
			 hasForm
			 on:open={onFormOpen}
  		     on:click:button--secondary={() => formOpen = false}
             on:submit={() => formValidation ? onFormSubmit() : null}
             >
	<Form on:submit={onFormSubmit}>
		{#if !$currentUser}
		<LoginNip07Button />
		{/if}
		<TextInput helperText="Use a name that describes the purpose of this new Rocket" invalid={nameInvalid} invalidText={nameError} on:keyup={validate} on:change={validate} labelText="Rocket Name" bind:value={rocketName} required/>
		[TODO: iterate over Problems to find all created by current user and allow them to select one for this Rocket]
	</Form>
</Modal>