<script lang="ts">
  import { unixTimeNow } from '$lib/helpers/mundane';
  import { rootTag, rocketNameValidator, simulate, hexPubkeyValidator, nostrocketIgnitionEvent, nostrocketIgnitionTag } from '$lib/settings';
  import ndk, { ndk_profiles } from '$lib/stores/ndk';
  import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
  import NostrEvent from '@nostr-dev-kit/ndk';
  import { currentUser } from "$lib/stores/current-user";
import { Header, Content, TextInput, Button, Modal, Form, Loading } from 'carbon-components-svelte';
import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
  import LoginNip07Button from '../LoginNIP07Button.svelte';
  import { BitcoinTipHeight } from '$lib/helpers/bitcoin';
  import { FUCKYOUVITE, consensusTipState } from '$lib/stores/state';
  import Profile from '../Profile.svelte';
  import { onMount } from 'svelte';
  import { get, writable } from 'svelte/store';

  let buttonDisabled = true;

  const profileData = writable(FUCKYOUVITE())
  const _ndk_profiles = get(ndk_profiles)

function getProfile(pubkey) {
	if (pubkey.length == 64) {
		let user = $ndk_profiles.getUser({hexpubkey: pubkey})
  		user.fetchProfile().then(profile=>{
    	if (user.profile) {
			buttonDisabled = false
			profileData.set(user)
   		 }
 		 })
	}
} 

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
		buttonDisabled = true
    } else {
        nameInvalid = false
        nameError = ""
		getProfile(pubkey)
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
		if ($currentUser?.hexpubkey()) {
			$consensusTipState.RocketMap.get(nostrocketIgnitionEvent)?.Participants.get($currentUser?.hexpubkey())?.forEach(pk=>{
				e.tags.push(["p", pk])
			})
		}
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
			 primaryButtonText={$profileData.profile?.name? "Add "+$profileData.profile?.name.toUpperCase()+" now": "Waiting for profile data"} secondaryButtonText="Cancel"
             primaryButtonIcon={User}
			 selectorPrimaryFocus=".bx--text-input"
			 modalHeading="Add someone to the Identity Tree"
			 hasForm
			 primaryButtonDisabled={buttonDisabled}
			 on:open={onFormOpen}
  		     on:click:button--secondary={() => formOpen = false}
             on:submit={() => formValidation ? onFormSubmit() : null}
             >
	<Form on:submit={onFormSubmit}>
		{#if !$currentUser}
		<LoginNip07Button />
		{/if}
		<TextInput helperText="Paste the person't pubkey in hex format" invalid={nameInvalid} invalidText={nameError} on:keyup={validate} on:change={validate} labelText="Pubkey (HEX)" bind:value={pubkey} required/>
		{#if buttonDisabled}<p><Loading withOverlay={false} small/>Waiting for profile</p>{/if}
		{#if !buttonDisabled}<Profile profile={$profileData} />{/if}
	</Form>
</Modal>