<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { Rocket, type Problem } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    InlineNotification,
    SelectableTile,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { ArrowRight, UserData } from "carbon-icons-svelte";
  import ProblemSelector from "../../../components/rockets/ProblemSelector.svelte";
  import RocketDisplay from "../../../components/rockets/RocketDisplay.svelte";

  let selected_problem: Problem | undefined = undefined;
  let mission: string = "";
  let mode: string = "pleb";
  let rocket: Rocket = new Rocket();
  let gitRepo:string|undefined = undefined;

  $: {
    if (selected_problem) {
      rocket.ProblemID = selected_problem.UID;
    }
  }
</script>

<h2>Rocket Launcher</h2>
<RocketDisplay problem={selected_problem} {rocket} />
{#if !selected_problem}
  <h3>STEP 1: What problem are you solving with this Rocket?</h3>
  <Tile>
    <p>
      A Rocket is a way for multiple collaborators to work collectively on <span
        style="font-weight:bold;">solving a problem</span
      > in the market. A good problem is one that exists in reality, affects real
      people, and is valuable enough that people will pay for a solution.
    </p>
    <br />
    <p>
      Any existing problems you've logged will be shown below. You can either
      select one of these, or <a href="#">log a new one now</a> instead.
    </p>
    <hr />
    <ProblemSelector
      bind:Selected={selected_problem}
      state={$consensusTipState}
    />
  </Tile>
{/if}

{#if selected_problem && !rocket.Mission}
  <br />
  <h3>STEP 2: The Heart of Your Rocket's Community</h3>
  <h6>
    You've identified a problem to solve, now it's time to tell potential
    contributors what your goals are.
  </h6>
  <p>
    A good mission goes beyond <span style="font-style:italic;">sane</span> and
    steps into
    <span style="font-style:italic;">you can't be serious</span>.
  </p>
  <p>
    Impossible missions create the right energy and attract the type of people a
    young project needs. Everyone, except for a few idealists, should find your
    mission impossible and crazy.
  </p>

  <p>
    To formulate a good mission, think back to the problem you are solving. For
    example, reddit is solving the problem of how to get the news from an
    internet with far too many sources of interesting information, and its
    mission is: <span style="font-style: italic;"
      >The front page of the internet</span
    >
  </p>
  <p>Some other good examples are:</p>

  <ul>
    <li style="font-style: italic;">
      The free encyclopedia that anyone can edit
    </li>
    <li style="font-style: italic;">a peer-to-peer electronic cash system</li>
    <li style="font-style: italic;">
      a truly censorship-resistant alternative to Twitter
    </li>
    <li style="font-style: italic;">
      Helps you connect and share with the people in your life
    </li>
    <li style="font-style: italic;">
      The fastest way ever to stop fiat mining
    </li>
  </ul>

  <InlineNotification
    kind="info"
    subtitle="This is not permanent, you can still change your mission later."
    hideCloseButton
    lowContrast
  />

  <TextInput
    placeholder="Tell potential contributors what you're fighting for"
    maxlength={70}
    bind:value={mission}
    required
    style="margin-bottom:1%;"
  /><Button
    icon={ArrowRight}
    on:click={() => {
      rocket.Mission = mission;
    }}>NEXT</Button
  >
{/if}

{#if selected_problem && rocket.Mission && !rocket.ConsensusMode}
  <h3>STEP 3: Do you want to be a dictator?</h3>
  <p>It's a serious question, and there's no shame in answering "yes".</p>
  <br />
  <div role="group" aria-label="selectable tiles">
    <SelectableTile
      on:select={() => {
        mode = "pleb";
      }}
      selected={mode == "pleb"}
    >
      <h4>Pleb Mode</h4>
      <p>
        If you don't have funding to pay for people to work on this Rocket, this
        is your only option.
      </p>
      <p>
        The Rocket is owned by Contributors in proportion to the work they have
        done. This rule applies to everyone, including you. Contributors to this
        Rocket will be able to vote on approving/rejecting Merit Requests.
      </p>
    </SelectableTile>

    <SelectableTile
      on:select={() => {
        mode = "dictator";
      }}
      selected={mode == "dictator"}
    >
      <h4>Dictator Mode</h4>
      <p>Enjoy all the benefits of ruling with an iron fist!</p>
      <p>
        You decide who can contribute, and what problems you want them to solve.
        Only YOU can approve or reject Merit Requests. Merits will still be
        created when you approve Merit Requests, but they will all belong to
        you.
      </p>
      <p>
        You will need to pay contributors in cold hard sats, and you need to
        have enough funding for the amounts to be competitive in the open
        market. You are essentially buying all Merits created within the Rocket
        in order to retain control. If you don't have funding for this, do not
        select this mode.
      </p>
      <p>
        This mode can be useful if you have an idea and some money, but don't
        have time/capability to build it yourself.
      </p>
    </SelectableTile>

    <InlineNotification
      kind="info"
      subtitle="You can convert a Dictator Mode Rocket into a Pleb Mode Rocket at any time. The other direction can only be accomplished by buying all Merits from all Contributors."
      hideCloseButton
      lowContrast
    />
    <Button
      icon={ArrowRight}
      on:click={() => {
        rocket.ConsensusMode = mode;
      }}>NEXT</Button
    >
  </div>

  <p />
{/if}

{#if selected_problem && rocket.Mission && rocket.ConsensusMode && (rocket.Repositories.size == 0 && gitRepo != "skip")}
  <h3>STEP 4: Git Repositories</h3>
  <p>Where should Contributors send pull requests?</p>
  <InlineNotification
    kind="info"
    subtitle="You can add/remove repositories at any time"
    hideCloseButton
    lowContrast
  />
  <TextInput
  placeholder="URL"
  bind:value={gitRepo}
  required
  style="margin-bottom:1%;"
/>
<Button
icon={ArrowRight}
on:click={() => {
    if (gitRepo) {
        rocket.Repositories.add(gitRepo)
    } else {
        gitRepo = "skip"
    }
}}>{gitRepo?"NEXT":"Skip this step"}</Button>
{/if}

{#if selected_problem && rocket.Mission && rocket.ConsensusMode && (rocket.Repositories.size > 0 || gitRepo == "skip")}
  <h3>STEP 5: Rocket Name</h3>
  
{/if}

<style>
  p {
    padding-top: 10px;
  }
</style>
