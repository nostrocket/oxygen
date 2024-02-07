<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    Accordion,
    AccordionItem,
    Button,
    Column,
    InlineNotification,
    Row,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { ArrowRight, Rocket } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  let statusErrorText: string | undefined = undefined;
  export let problem: Problem;
  export let rocket: Rocket;
</script>

<Row padding>
  <Column>
    <Tile light>
      <h5>
        NEXT STEPS FOR <CommentUser pubkey={$currentUser.pubkey} />
      </h5>
      <p>
        You logged this Problem. According to <CommentUser pubkey={problem.ClaimedBy} /> it is now solved. Please validate that it is indeed solved, and close it if so <ArrowRight />
      </p>
      <hr />
      <Accordion>
        <AccordionItem title="THE PROBLEM IS NOT SOLVED">
            <p>Please explain to <CommentUser pubkey={problem.ClaimedBy} /> why this problem is not solved. The form below will automatically tag them.</p>
            <p>This is not implemented yet but it SHOULD: publish a comment that tags the problem and the person who claimed this problem. It should also fire off another event that marks it as "claimed" instead of "patched", and resets the timer.</p>
            <TextInput></TextInput>
            <Button>PUBLISH</Button>
        </AccordionItem>
       
      </Accordion>
      {#if statusErrorText}<InlineNotification
          title="ERROR"
          subtitle={statusErrorText}
        />{/if}
    </Tile>
  </Column>
</Row>

<style>
  ul {
    list-style-position: inside;
    line-height: 140%;
    list-style-type: square;
    margin: 1%;
    font-size: 12pt;
  }

  li {
    margin: 1%;
  }
</style>
