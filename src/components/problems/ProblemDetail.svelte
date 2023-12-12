<script lang="ts">
  import { goto } from "$app/navigation";
  import { getDepthColor } from "$lib/helpers/ProblemDepthColor";
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
    breakpointObserver,
  } from "carbon-components-svelte";
  import { CaretLeft, CaretRight, Edit } from "carbon-icons-svelte";
  import { writable } from "svelte/store";
  import Contributing from "./Contributing.svelte";
  import ProblemSidebarActions from "./ProblemSidebarActions.svelte";
  import { base } from "$app/paths";
  import CommentsContainer from "../../components/comments/CommentsWrapper.svelte";

  export let problem = writable<Problem>();
  export let claimable: boolean;
  export let currentUserIsMaintainer: boolean = false;
  export let rocket:Rocket|undefined = undefined;
  let previous: string | undefined = undefined;
  let next: string | undefined = undefined;
  let size = breakpointObserver();

  let edit = false;

  $: {
    edit = false;
    previous = undefined;
    next = undefined;
    if ($problem) {
      let parent: Problem | undefined = undefined;
      if ($problem.Parents.size > 0) {
        parent = $consensusTipState.Problems.get(
          $problem.Parents.values().next().value
        );
        if (parent) {
          let problemArray = [...parent.Children];
          let i = 0;
          for (let p of problemArray) {
            if (p == $problem.UID) {
              previous = problemArray[i - 1];
              next = problemArray[i + 1];
            }
            i++;
          }
        }
      }
    }
  }
</script>

<Row
  style="margin-left:{$problem.Depth}%;border-left: {getDepthColor(
    $problem.Depth
  )} 4px solid;padding-left: 6px"
>
  <div
    style={edit
      ? "padding:6px;border:solid;border-width:thin;border-color:DodgerBlue;"
      : ""}
  >
    <Row>
      <Column>
        {#if $size == "sm" || $size == "md"}
          <Row>
            <Column style="padding-bottom: 5px">
              <Tile>
                <ProblemSidebarActions
                  {claimable}
                  {problem}
                  status={problemStatus($problem, $consensusTipState)}
                  {currentUserIsMaintainer}
                />
              </Tile>
            </Column>
          </Row>
        {/if}

        <Row>
          <Column max={1} xlg={1} lg={1} md={1} sm={1}
            ><Button
              iconDescription="Previous Problem"
              style="height:100%;"
              kind="ghost"
              icon={CaretLeft}
              disabled={previous ? false : true}
              on:click={() => {
                goto(`${base}/problems/${previous}`);
              }}
            /></Column
          >
          <Column>
            <h4 style="text-transform: uppercase">
              {$problem?.Title}
              {#if currentUserIsMaintainer || $currentUser?.pubkey == $problem.CreatedBy}<a
                  href="#"
                  on:click={() => {
                    edit = true;
                  }}><Edit /></a
                >{/if}
            </h4>
            {#if edit}<TextInput bind:value={$problem.Title} size="sm" />{/if}
          </Column>
          <Column max={1} xlg={1} lg={1} md={1} sm={1}
            ><Button
              disabled={next ? false : true}
              iconDescription="Next Problem"
              style="height:100%;"
              kind="ghost"
              icon={CaretRight}
              on:click={() => {
                goto(`${base}/problems/${next}`);
              }}
            /></Column
          >
        </Row>
      </Column>
    </Row>

    <Row padding>
      <Column>
        <Tile>
          <h5 style="padding-bottom: 15px">Summary</h5>
          <p>{$problem.Summary}</p>
          {#if edit}<Tile light><TextArea bind:value={$problem.Summary} /></Tile
            >{/if}
        </Tile>
      </Column>
    </Row>

    {#if !edit && $problem.Status == "claimed" && $problem.ClaimedBy == $currentUser?.pubkey}
      <Contributing {rocket} problem={$problem} />
    {/if}

    <Row padding>
      <Column>{@html makeHtml(problem?.FullText)}</Column>
    </Row>
    {#if edit}
      <Row padding>
        <Column
          ><Tile light><TextArea bind:value={$problem.FullText} /></Tile
          ></Column
        >
      </Row>
    {/if}

    {#if edit}
      <Select
        hideLabel
        size="xl"
        labelText="Status"
        bind:selected={$problem.Rocket}
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
            publishProblem($consensusTipState, $problem);
            edit = false;
          }}>Publish Change</Button
        >
      </ButtonSet>
    {/if}
  </div>
      <CommentsContainer problem={$problem} parentId={$problem?.UID} isRoot={true} />
</Row>
