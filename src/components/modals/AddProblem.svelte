<script lang="ts">
    import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
    import { unixTimeNow } from "$lib/helpers/mundane";
    import {
      nostrocketIgnitionEvent,
      nostrocketIgnitionTag,
      rootTag,
      simulate
    } from "$lib/settings";
    import { currentUser } from "$lib/stores/current-user";
    import ndk from "$lib/stores/ndk";
    import { FUCKYOUVITE } from "$lib/stores/state";
    import { NDKEvent } from "@nostr-dev-kit/ndk";
    import {
      Button,
      Form,
      Modal,
      Row,
      TextArea,
      TextInput
    } from "carbon-components-svelte";
    import { DataEnrichmentAdd } from "carbon-icons-svelte";
    import { writable } from "svelte/store";
    import LoginNip07Button from "../LoginNIP07Button.svelte";
  
    let buttonDisabled = true;
    let notLoggedIn = true;
  
    const profileData = writable(FUCKYOUVITE());

    let formOpen = false;
    let title_text = "";
    let summary_text = "";
    let full_text = "";
    let formValidation = true;
  
    let titleError = "";
    let titleInvalid = false;

    $: {
        if (title_text.length < 10 ) {
        titleInvalid = true;
        titleError = title_text.length.toString() + " characters isn't big enough for anyone...";
      } else {
        titleInvalid = false
        titleError = ""
      }
        if ($currentUser) {
            notLoggedIn = false
        } else {
            notLoggedIn = true
        }

        buttonDisabled = (titleInvalid || notLoggedIn)
    }
  
    function reset() {
      title_text = "";
      titleError = "";
    }

    function onFormSubmit() {
        if (!buttonDisabled) {
            let e = new NDKEvent($ndk);
      e.kind = 15171971;
      e.created_at = unixTimeNow();
      e.tags.push(rootTag);
      e.tags.push(nostrocketIgnitionTag);
      e.tags.push(["d", nostrocketIgnitionEvent]);
      let bth = BitcoinTipHeight()
      e.tags.push(["h", bth.height+":"+bth.hash]);
      //e.tags.push(["t", title_text, ""]);
      if (!simulate) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent(), x)
            let text_event = textEvent()
            text_event.publish().then((y)=>{
                console.log(text_event.rawEvent(), y)
                let commit_event = commitEvent(e.id, text_event.id, "", "open")
                commit_event.publish().then((z)=>{
                    console.log(commit_event.rawEvent(), z)
                    //if we are a maintainer on this problem, publish a new HEAD
                    if (true) {
                        let head_event = headEvent(e.id, commit_event.id, "open", nostrocketIgnitionEvent)
                        head_event.publish().then((a)=>{
                            console.log(head_event.rawEvent(), a)
                            formOpen = false;
                            reset();
                        }).catch((err)=>{throw new Error("failed to publish Problem HEAD event. " + err)})
                    } else {
                        formOpen = false;
                        reset();
                    }
                }).catch((err)=>{throw new Error("failed to publish Problem COMMIT event. " + err)})
            }).catch((err)=>{throw new Error("failed to publish Problem TEXT event. " + err)})
          }).catch((err) => {throw new Error("failed to publish Problem ANCHOR event. " + err)});
      } else {
        e.sign().then(() => {
          console.log(e.rawEvent());
          formOpen = false;
          reset();
        });
      }
        }
    }

function headEvent(anchorID, commitID, status, rocket) {
    let e = new NDKEvent($ndk);
    e.kind = 31971
    e.created_at = unixTimeNow();
    e.tags.push(rootTag);
    let bth = BitcoinTipHeight()
    e.tags.push(["h", bth.height+":"+bth.hash]);
    e.tags.push(["e", anchorID, "", "anchor"])
    e.tags.push(["e", commitID, "", "commit"])
    e.tags.push(["s", status])
    let rocketTag = ["e", nostrocketIgnitionEvent, "", "rocket"]
    if (rocket != nostrocketIgnitionEvent) {
        rocketTag[1] = rocket
    }
    e.tags.push(rocketTag)
    return e
}


function commitEvent(anchorID, textID, previous, status) {
    let e = new NDKEvent($ndk);
    e.kind = 15171972
    e.created_at = unixTimeNow();
    e.tags.push(rootTag);
    let bth = BitcoinTipHeight()
    e.tags.push(["h", bth.height+":"+bth.hash]);
    e.tags.push(["e", anchorID, "", "anchor"])
    e.tags.push(["e", textID, "", "text"])
    if (previous) {
        e.tags.push(["e", previous, "previous"])
    }
    e.tags.push(["s", status])
    return e
}

function textEvent() {
    let e = new NDKEvent($ndk);
    e.kind = 15171973;
      e.created_at = unixTimeNow();
      e.tags.push(rootTag);
      let bth = BitcoinTipHeight()
      e.tags.push(["h", bth.height+":"+bth.hash]);
      e.tags.push(["t", title_text, "title"])
      if (summary_text.length > 0) {
        e.tags.push(["t", summary_text, "summary"])
      }
      if (full_text.length > 0) {
        e.tags.push(["t", full_text, "full"])
      }
    return e
}

    function onFormOpen() {
      // Hack form assocation
      const modal = document.querySelector(".bx--modal");
      const form = modal.querySelector("form");
      const button = modal.querySelector(".bx--btn--primary");
  
      const id = "I" + Math.random().toString().substring(2);
      form.setAttribute("id", id);
      button.setAttribute("form", id);
      // Reverted by binding update on input change
      button.setAttribute("type", "submit");
    }
  </script>

  <Button size="small" icon={DataEnrichmentAdd}
    on:click={() => {
      formOpen = true;
    }}>Log a New Problem Now</Button>
  
  <Modal
    bind:open={formOpen}
    shouldSubmitOnEnter={false}
    primaryButtonText="Submit"
    secondaryButtonText="Cancel"
    primaryButtonIcon={DataEnrichmentAdd}
    selectorPrimaryFocus=".bx--text-input"
    modalHeading="Log a Problem You Currently Face or Have Observed"
    hasForm
    primaryButtonDisabled={buttonDisabled}
    on:open={onFormOpen}
    on:click:button--secondary={() => (formOpen = false, reset())}
    on:submit={() => (formValidation ? onFormSubmit() : null)}
  >
    <Form on:submit={onFormSubmit}>
      {#if !$currentUser}
      <Row>
        <LoginNip07Button />
    </Row>
      {/if}
      <TextInput
        invalid={titleInvalid}
        invalidText={titleError}
        labelText="Problem Title"
        maxlength={100}
        bind:value={title_text}
        required 
        style="margin-bottom:1%;"/>
<TextArea
bind:value={summary_text}
labelText="Problem Summary"
maxlength={280}
placeholder="Briefly describe the problem you face or have observed. MUST be plaintext, no markdown. Max 280 characters." 
style="margin-bottom:1%;"/>
<TextArea
bind:value={full_text}
labelText="Full Problem Statement [OPTIONAL]"
placeholder="Explain the problem in full. Markdown is allowed."
rows={20} 
style="margin-bottom:1%;"/>
    
    </Form>
  </Modal>
  