<script>
import { Header, Content, TextInput, Button, Modal, Form } from 'carbon-components-svelte';
import { Airplane, Rocket, User } from "carbon-pictograms-svelte";
let formOpen = false;
let rocketName = '';
let formValidation = true;

let nameError = "";
let nameInvalid = false;
let nameRegex = /^\w{5,20}$/

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
		alert('submitted: ' + JSON.stringify(rocketName));
		formOpen = false;
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
			 modalHeading="Form modal"
			 hasForm
			 on:open={onFormOpen}
  		     on:click:button--secondary={() => formOpen = false}
             on:submit={() => formValidation ? onFormSubmit() : null}
             >
	<Form on:submit={onFormSubmit}>
		<TextInput helperText="Use a name that describes the purpose of this new Rocket" invalid={nameInvalid} invalidText={nameError} on:keyup={validate} on:change={validate} labelText="Rocket Name" bind:value={rocketName} required/>
	</Form>
</Modal>