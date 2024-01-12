<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { HandleProblemEvent } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import { Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    InlineNotification,
    Row,
    TextArea,
    Tile,
    TileGroup,
  } from "carbon-components-svelte";
  import {
    ArrowLeft,
    ArrowRight,
    Checkmark,
    Error as ErrorIcon,
  } from "carbon-icons-svelte";
  import { NewRocketProblem, simulateEvents } from "../../settings";
  import ProblemSummaryForm from "./ProblemSummaryForm.svelte";
  import ProblemTextView from "./ProblemTextView.svelte";
  import ProblemTitleForm from "./ProblemTitleForm.svelte";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  
  export let parent: Problem | undefined = undefined;

  let step: number = 0;
  let newProblem: Problem = new Problem();
  let step0input: string = "";
  let summaryInput: string = "";
  let canPublish = false;
  let disabled = true;
  let error:string|undefined = undefined;

  $: {
    if ((step == 2 && step0input.length <= 280) || step == 3) {
      canPublish = true;
    }
    if (step == 0 && step0input.length > 30) {
      disabled = false;
    }
    if (step > 1) {
      if (summaryInput.length > 0 && step0input.length > 280) {
        newProblem.Summary = summaryInput;
        newProblem.FullText = step0input;
      } else if (step0input.length <= 280) {
        newProblem.Summary = step0input;
      }
    }
  }

  function publish() {
    if (!parent) {
      parent = $consensusTipState.Problems.get(NewRocketProblem);
    }
    if (!parent) {
      throw new Error("could not find a parent");
    }
    if (canPublish) {
      let e = makeEvent({
        kind: 1971,
        rocket: parent.Rocket, //todo: check parent problem's rocket and use that here
      });
      e.tags.push(["text", newProblem.Title, "tldr"]);
      if (newProblem.Summary) {
        e.tags.push(["text", newProblem.Summary, "paragraph"]);
      }
      if (newProblem.FullText) {
        e.tags.push(["text", newProblem.FullText, "page"]);
      }
      e.tags.push(["e", parent.UID, "", "parent"]);
      e.tags.push(["new"]);

      e.tags.push(["status", "open"]);
      e.tags.push(["alt", "[ " + newProblem.Title + " ]" + newProblem.Summary]);
      e.author = $currentUser!;
      e.content =
        "[ " +
        newProblem.Title +
        " ]" +
        newProblem.Summary +
        " read more using a Nostrocket client.";

      let err = HandleProblemEvent(e, $consensusTipState.Copy());
      if (err != undefined) {
        console.log(err);
        return;
      }
      if (!simulateEvents) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent(), x);
            goto(`${base}/problems/${e.id}`);
          })
          .catch((err) => {
            console.log(e);
            throw new Error("failed to publish Problem event. " + err);
          });
      } else {
        e.sign().then(() => {
          console.log(e.rawEvent());
        });
      }
    }
  }
</script>

<h2>Log a New Problem</h2>
{#if !$currentUser}
  <InlineNotification
    kind="error"
    title="ERROR:"
    subtitle="You must be logged in to submit new Problems."
  />
  <LoginNip07Button />
{/if}
{#if $currentUser && parent}
  {#if parent.UID != NewRocketProblem}
    <InlineNotification
      kind="info-square"
      title="NOTE:"
      subtitle="You are logging a new Problem as a child under this one:"
      lowContrast
      ><ProblemTextView problem={parent} size="small" /></InlineNotification
    >
  {/if}
  {#if step == 0}
    {#if parent.UID != NewRocketProblem}
      <h4>
        STEP {step}: Document the real problem first, and the solution second.
      </h4>
      <TileGroup>
        <Tile style="margin-bottom:2px;"
          ><p>
            <ErrorIcon />
            “We need feature X. Solution: make it” is
            <span style="font-weight: bold;">not</span> a good issue.
          </p></Tile
        >
        <Tile>
          <p>
            <Checkmark />
            “user cannot do common tasks A or B except by using a complex workaround.
            Solution: make feature X” is a decent explanation.
          </p>
        </Tile>
      </TileGroup>
      <InlineNotification
      lowContrast
        kind="info-square"
        title="Good to know:"
        subtitle="If you don't have any ideas about what a solution might look like, it
      doesn't matter, just log the problem and the community will figure out what
      the solution is."
      />
    {/if}
    {#if parent.UID == NewRocketProblem}
    <h4>
      STEP {step}: What problem are you trying to solve?
    </h4>
    <p>It looks like you're logging this problem in order to create a new Rocket, cool!</p>
    <p>Think BIG, and think DEEP. What problem are you REALLY solving with this Rocket?</p>
    <p>Your problem statement is critical to attracting contributors to your Rocket.</p>
    <InlineNotification
    lowContrast
    kind="info-square"
    title="Good to know:"
    subtitle="You don't have to get this perfect right now, it can be edited later. If you need help formulating your problem statement, do the best you can and then ask the community for feedback."
  />
    {/if}
    {#if step0input.length > 280}<InlineNotification
        lowContrast
        kind="info"
        title="NOTICE"
        subtitle="Markdown is now enabled"
      />{/if}
    <TextArea
      invalid={disabled}
      invalidText="text is too short"
      bind:value={step0input}
      placeholder="Use as much space as required to explain the problem and any potential solutions."
      rows={20}
      style="margin-bottom:1%;"
    />
  {/if}

  {#if step == 1}
    <h4>
      STEP {step}: {step0input.length > 280
        ? "SUMMARIZE THE PROBLEM IN ONE PARAGRAPH"
        : "SUMMARIZE THE PROBLEM IN ONE SENTENCE"}
    </h4>
    {#if step0input.length > 280}
      <ProblemSummaryForm bind:text={summaryInput} />
    {/if}

    {#if step0input.length <= 280}
      <ProblemTitleForm bind:text={newProblem.Title} />
    {/if}
  {/if}

  {#if step == 2 && step0input.length > 280}
    <h4>STEP {step}: SUMMARIZE THE PROBLEM IN ONE SENTENCE</h4>
    <ProblemTitleForm bind:text={newProblem.Title} />
  {/if}

  {#if canPublish}
    <h4>STEP {step}: PUBLISH THE PROBLEM NOW!</h4>
    <ProblemTextView problem={newProblem} />
    {#if step0input.length > 280}<InlineNotification
        lowContrast
        kind="info"
        title="NOTICE"
        subtitle="You can now publish this problem if you think everything looks good."
      />{/if}
  {/if}

  {#if error}<InlineNotification title="ERROR" subtitle={error}/>{/if}

  <ButtonSet>
    <Button
      disabled={step == 0}
      kind="secondary"
      icon={ArrowLeft}
      on:click={() => {
        step--;
        canPublish = false;
      }}>BACK</Button
    >
    <Button
      disabled={step0input.length < 30}
      icon={ArrowRight}
      on:click={() => {
        if (canPublish) {
          publish();
        } else {
          step++;
        }
      }}>{canPublish ? "PUBLISH" : "NEXT"}</Button
    >
  </ButtonSet>
{/if}
