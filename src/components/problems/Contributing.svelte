<script lang="ts">
  import { UpdateStatus } from "$lib/helpers/publishProblem";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    Row,
    Column,
    Tile,
    InlineNotification,
    Button,
    Accordion,
    AccordionItem,
  } from "carbon-components-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { ArrowRight } from "carbon-icons-svelte";
  let statusErrorText: string | undefined = undefined;
  export let problem: Problem;
  export let rocket: Rocket|undefined = undefined;
</script>
{#if rocket}
<Row padding>
  <Column>
    <Tile light>
      <h5>
        NEXT STEPS FOR <CommentUser pubkey={$currentUser.pubkey} />
      </h5>
      <p>
        You have claimed this problem to work on it. If you did this by mistake
        or you don't want to do it any more for any reason, you should <a
          href="#"
          on:click={() => {
            UpdateStatus(problem, "open")
              .then(console.log)
              .catch((error) => {
                console.error(error);
                statusErrorText = error;
              });
          }}>abandon</a
        > the problem now.
      </p>
      <hr />
      <Accordion>
        <AccordionItem title="STEP 0: MAKE SURE THIS PROBLEM IS VALID">
      <ul>
        <li>The Problem is documented such that the claim is testable.</li>
        <li>
          The Problem has been tested appropriately and shown to be a true and
          accurate observation of reality.
        </li>
        <li>
          You SHOULD NOT need to spend more than 6 working hours on solving this
          problem, if the problem is too complex, break it down into smaller
          problems by adding child Problems.
        </li>
        <li>
          To be awarded Merits, existing Contributors to {rocket.Name} MUST agree
          that this Problem is in the
          <span style="font-weight:bold">direct path</span>
          towards:
          <ul>
            <li>onboarding the next Participant(s) in {rocket.Name}, and/or</li>
            <li>generating profit for {rocket.Name} Contributors.</li>
          </ul>
        </li>
      </ul>
    </AccordionItem>
    <AccordionItem title="STEP 1: CREATE A PULL REQUEST">
      {#if rocket.Repositories.size > 0}
        <p>
          If your pull request does not violate the <a href="#"
            >Nostrocket Unprotocol</a
          >
          it <span style="font-weight:bold">will</span> be merged.
        </p>
        <ul>
          <li>SHOULD contain exactly ONE commit</li>
          <li>
            SHOULD contain a commit message identical to the title of this
            Problem
          </li>
          <li>
            SHOULD be a minimal and accurate solution to the problem described
            here, and nothing else
          </li>
          <li>
            SHOULD adhere to the code style guidelines if these are defined
          </li>
          <li>MUST pass all self-tests and MUST NOT not break anything</li>
          <li>
            SHOULD NOT create any additional learning curve for the end user
          </li>
        </ul>
        <InlineNotification
          kind="info-square"
          lowContrast
          title="NEED HELP?"
          subtitle="If this is your first time sending a pull request, we have step-by-step instructions to make it easy for you!"
          ><Button kind="ghost">View Instructions</Button></InlineNotification
        >
        <InlineNotification
          kind="info-square"
          lowContrast
          title="GOOD TO KNOW"
          subtitle="Not all problems can be solved with code. We are currently working to make Nostrocket applicable to more than just code."
        />

        <!-- {#each rocket.Repositories as repo}<a href={repo.toString()}>{repo.toString()}</a>{/each} -->
      {:else}
        A repository has not been configured for {rocket?.Name}. Please contact <CommentUser
          pubkey={rocket.CreatedBy}
        /> and ask them to add a repository to {rocket?.Name}.
      {/if}
    </AccordionItem>
    <AccordionItem title="STEP 2: MARK AS PATCHED AND READY FOR REVIEW">
        <p>After your pull request has been merged, you SHOULD validate that you've really solved the problem and that it all works properly in "production". If not, you may need to send another pull request.</p>
        <br />
        <p>Once you are confident that the problem is indeed solved, the next step is to mark the problem as patched and ready for review <ArrowRight /></p>
    </AccordionItem>
    <AccordionItem title="STEP 2: REQUEST MERITS FOR YOUR WORK">
      <p>
        If your pull request is merged, and the creator of the Problem (or any Maintainer) closes the Problem, you are then eligible to request Merits
        for your work. Merits are a representation of how much work has been contributed to a
        Rocket and who made the contributions.
      </p>
<br />
      <p>
        The existing set of Contributors will decide if your Merit Request
        should be approved or rejected based on the Nostrocket Unprotocol.
      </p>
      <ul>
        <li>
          Does it solve the problem, and is it reasonable to believe this is the
          simplest possible solution?
        </li>
        <li>
          Is the requested amount reasonable when compared to that of all other
          Merit requests for this Rocket?
        </li>
        <li>
          Was the work done by the person making the request for merits, to the
          exclusion of all others?
        </li>
      </ul>
    </AccordionItem>
    </Accordion>
      {#if statusErrorText}<InlineNotification
          title="ERROR"
          subtitle={statusErrorText}
        />{/if}
    </Tile>
  </Column>
</Row>
{/if}
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
