<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    InlineNotification,
    TextArea,
  } from "carbon-components-svelte";
  import { ArrowRight, Send } from "carbon-icons-svelte";
  import CommentUser from "../../comments/CommentUser.svelte";
  import Claim from "../buttons/ClaimProblem.svelte";
  import CloseProblem from "../buttons/CloseProblem.svelte";
  import AbandonProblem from "../buttons/AbandonProblem.svelte";
  import Countdown from "../../elements/Countdown.svelte";
  import makeEvent from "$lib/helpers/eventMaker";
  import { relayHint } from "../../../settings";
  import { UpdateStatus } from "$lib/helpers/publishProblem";

  export let problem: Problem;
  export let rocket: Rocket;
  export let currentUserCanModify = false;

  let patch: string;

  function detectPullRequest(content: string): URL | null {
    if (content) {
      for (let repo of rocket.Repositories) {
        if (content.includes(repo.toString())) {
          return repo;
        }
      }
    }
    return null;
  }

  function PublishPullRequest(patchLink:string) {
    let url = new URL(patchLink);
    if (!url) {
      throw new Error("invalid URL");
    }
    let textEvent = makeEvent({
      kind: 1,
      rocket: problem.Rocket,
    });
    textEvent.tags.push(["p", problem.CreatedBy]);
    textEvent.tags.push(["e", problem.UID, relayHint, "root"]);
    textEvent.content =
      "I've resolved this problem with a patch: " + url.toString();
    textEvent.publish().then(() => {
      UpdateStatus(problem, "patched")
        .then(console.log)
        .catch((error) => {
          //todo: use a toast
          console.error(error);
        });
    });
  }
</script>

{#if (problem.CreatedBy == $currentUser?.pubkey || rocket.isMaintainer($currentUser.pubkey)) && problem.Status == "patched"}
<h4><ArrowRight /> ACTION REQUIRED</h4>
<p>This problem has been patched by <CommentUser pubkey={problem.ClaimedBy} /></p>
<p>Is it now solved? If so, please close this problem. If not, please let <CommentUser pubkey={problem.ClaimedBy} /> know why (in the discussion)</p>
{/if}

<ButtonSet>
  <Claim {problem} />
  <AbandonProblem {problem} />
  <CloseProblem {currentUserCanModify} kind="button" {problem} />
</ButtonSet>

{#if $currentUser?.pubkey == problem.ClaimedBy && problem.Status == "claimed"}
  <hr />
  <h4>
    <ArrowRight />ACTION REQUIRED FOR <CommentUser
      pubkey={$currentUser.pubkey}
    />
  </h4>
  <Countdown
    claimedByPubkey={problem.ClaimedBy}
    endUnix={(problem.ClaimedAt + 259200) * 1000}
  />
  //todo: add rocket style guidelines if these are defined
  <p>
    If you cannot send a patch within the time limit, please let a maintainer
    know in the comments.
  </p>
  <h4>Patch this problem</h4>
  <p>Clone the repo locally:</p>
  {#each rocket.Repositories as repo}
    <code>git clone {repo}</code>
    <br />
  {/each}
  <code>git checkout -b {problem.UID.substring(0, 8)}</code>
  <br />
  <p>Solve the problem, and then:</p>
  <code>git commit -m '{problem.Title}'</code>
  <br />
  <code>git format-patch -1 HEAD --stdout | pbcopy</code>
  <TextArea
    placeholder="Paste the Patch content here, or paste the URL of a commit."
    bind:value={patch}
  />
  {#if detectPullRequest(patch)}<InlineNotification
      kind="info-square"
      lowContrast
      title="PULL REQUEST"
      subtitle="A pull request has been detected"
    />{/if}
  <Button
    on:click={() => {
      let r = detectPullRequest(patch);
      if (r) {
        PublishPullRequest(patch.trim())
      }
    }}
    style="float:right;"
    icon={Send}>PUBLISH</Button
  >
  <hr />
  <h4>RULES FOR PATCHES AND PULL REQUESTS</h4>
  <ul class="problemUL">
    <li>
      Solve only the stated problem, and solve it in the simplest possible way
    </li>
    <li>Squash all commits into one single commit</li>
    <li>Do not make whitespace changes to lines that you have not modified</li>
    <li>Follow the rocket style guide if this is defined</li>
    <li>Do not break any tests</li>
    <li>DO NOT BREAK USERSPACE</li>
  </ul>
{/if}
