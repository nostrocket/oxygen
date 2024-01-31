<script lang="ts">
  import { makeHtml } from "$lib/helpers/mundane";
  import { problemStatus } from "$lib/helpers/problem";
  import { publishProblem } from "$lib/helpers/publishProblem";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    Column,
    Row,
    Select,
    SelectItem,
    SelectItemGroup,
    TextArea,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import CommentsContainer from "../../components/comments/CommentsWrapper.svelte";
  import Contributing from "./Contributing.svelte";
  import CreateMeritRequest from "./CreateMeritRequest.svelte";
  import ProblemSidebarActions from "./ProblemSidebarActions.svelte";

  export let problem:Problem
  export let claimable: boolean;
  export let currentUserIsMaintainer: boolean = false;
  export let rocket:Rocket|undefined = undefined;
  let previous: string | undefined = undefined;
  let next: string | undefined = undefined;

  export let edit:boolean;

  $:noMeritRequestLogged = true;

  $: {
    if (problem && rocket) {
      for (let [_, m] of rocket.Merits) {
        if (m.Problem == problem.UID) {
          noMeritRequestLogged = false
        }
      }
    }
  }
</script>
      <Column>
        {#if "" == "sm" || $size == "md"}
          <Row>
            <Column style="padding-bottom: 5px">
              <Tile>
                <ProblemSidebarActions
                  {claimable}
                  {problem}
                  status={problemStatus(problem, $consensusTipState)}
                  {currentUserIsMaintainer}
                />
              </Tile>
            </Column>
          </Row>
        {/if}

        <Row>
          <Column>


            {#if edit}<TextInput bind:value={problem.Title} size="sm" />{/if}
          </Column>
        </Row>
      </Column>

    <Row padding>
      <Column>
        <Tile>
          <h5 style="padding-bottom: 15px">Summary</h5>
          <p>{problem.Summary}</p>
          {#if edit}<Tile light><TextArea bind:value={problem.Summary} /></Tile
            >{/if}
        </Tile>
      </Column>
    </Row>


    {#if noMeritRequestLogged && problem.ClaimedBy == $currentUser?.pubkey && problem.Status == "closed"}
      <CreateMeritRequest rocket={rocket} problem={problem} />
    {/if}
    {#if !edit && problem.Status == "claimed" && problem.ClaimedBy == $currentUser?.pubkey}
      <Contributing {rocket} problem={problem} />
    {/if}
    {#if edit}
    <Row padding>
      <Column
        ><Tile light><TextArea bind:value={problem.FullText} /></Tile
        ></Column
      >
    </Row>
    <Select
        hideLabel
        size="xl"
        labelText="Status"
        bind:selected={problem.Rocket}
      >
        <SelectItemGroup label="SELECT WHICH ROCKET THIS BELONGS TO">
          {#each $consensusTipState.RocketMap as [key, r]}
            {#if r.CreatedBy == $currentUser?.pubkey}
              <SelectItem value={key} text={r.Name} />
            {/if}
          {/each}
        </SelectItemGroup>
      </Select>
      <ButtonSet>
        <Button
          kind="secondary"
          size="field"
          on:click={() => {
            edit = false;
          }}>Cancel</Button
        >
        <Button
          size="field"
          on:click={() => {
            publishProblem($consensusTipState, problem);
            edit = false;
          }}>Publish Change</Button
        >
      </ButtonSet>
  {/if}

    <Row padding>
      <Column>{@html makeHtml(problem?.FullText)}</Column>
    </Row>

    {#if edit}
      
    {/if}
    <Tile>
      <CommentsContainer problem={problem} parentId={problem?.UID} isRoot={true} />
    </Tile>
<hr />