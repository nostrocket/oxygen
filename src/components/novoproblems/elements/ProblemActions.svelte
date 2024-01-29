<script lang="ts">
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Button, ButtonSet, TextArea } from "carbon-components-svelte";
  import Claim from "../buttons/ClaimProblem.svelte";
  import CloseProblem from "../buttons/CloseProblem.svelte";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import CommentUser from "../../comments/CommentUser.svelte";
  import { ArrowRight, Rocket, Send } from "carbon-icons-svelte";

  export let problem: Problem;
  export let rocket: Rocket;
  export let currentUserCanModify = false;

  let patch: string;
</script>

<ButtonSet>
  <Claim {problem} />
  <CloseProblem {currentUserCanModify} kind="button" {problem} />
</ButtonSet>

{#if $currentUser?.pubkey == problem.ClaimedBy}
  <hr />
  <h4>
    <ArrowRight />ACTION REQUIRED FOR <CommentUser
      pubkey={$currentUser.pubkey}
    />
  </h4>
  <p>You claimed this problem 11 blocks ago, please send your patch within 411 blocks or someone else will be able to claim it.</p>
  <h4>Patch this problem</h4>
  <p>Clone the repo locally:</p>
  {#each rocket.Repositories as repo}
    <code>git clone {repo}</code>
    <br />
  {/each}
  <code>git checkout -b {problem.UID.substring(0,8)}</code>
  <br />
  <p>Solve the problem, and then:</p>
  <code>git commit -m '{problem.Title}</code>
  <br />
  <code>git format-patch -1 HEAD --stdout | pbcopy</code>
  <TextArea placeholder="Paste the result here" labelText="" value={patch} />
  <Button icon={Send}>PUBLISH NIP34 PATCH</Button>
{/if}
