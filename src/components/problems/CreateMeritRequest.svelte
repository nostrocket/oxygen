<script lang="ts">
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { Problem, Rocket } from "$lib/stores/nostrocket_state/types";
  import { validate } from "bitcoin-address-validation";
  import {
    Button,
    Checkbox,
    Column,
    ExpandableTile,
    InlineNotification,
    NumberInput,
    Row,
    TextInput,
    Tile
  } from "carbon-components-svelte";
  import { ArrowRight } from "carbon-icons-svelte";
  import CommentUser from "../comments/CommentUser.svelte";
  import makeEvent from "$lib/helpers/eventMaker";
  let statusErrorText: string | undefined = undefined;
  export let problem: Problem;
  export let rocket: Rocket | undefined = undefined;
  let meritRequest = {
    amount: 0,
    sats: false,
    onchain: "",
    lud16: "",
    trustedZapReceiptPubkey: "",
  };

  let cuckPrice: number | undefined = undefined;
  let canSubmit = false
  $: {
    if (meritRequest.amount < 100) {
        canSubmit  = false
    } else {
        canSubmit = true
        if (meritRequest.sats) {
            if (!validate(meritRequest.onchain)) {
                canSubmit = false
            } 
            if (!validateLud16(meritRequest.lud16)) {
                canSubmit = false
            }
        }
    }
  }

  $: {
    if (!cuckPrice) {
      getCuckPrice();
    }
  }

  function getCuckPrice() {
    var url = "https://api.coindesk.com/v1/bpi/currentprice.json";
    var symbol = "USD";
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        cuckPrice = parseFloat(data.bpi[symbol].rate.replace(/,/g, ""));
      });
  }

  function validateAmount(amount:number):boolean {
    if (amount > 100 && Number.isInteger(amount)) {
        return true
    }
    return false
  }

  function validateLud16(address: string) {
    if (address.length == 0) {
      return true;
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(address)) {
      return true;
    }
    return false;
  }

  let published = false

  function publshMeritRequest() {
    let e = makeEvent({kind:1602, rocket:rocket?.UID})
    e.tags.push(["e", problem.UID, "problem"])
    if (validate(meritRequest.onchain)) {
        e.tags.push(["onchain", meritRequest.onchain])
    }
    e.tags.push(["amount", meritRequest.amount.toString()])
    e.publish().then(()=>{
        published = true
    })
  }
</script>

{#if problem && rocket && !published}
  <Row padding>
    <Column>
      <Tile light>
        <h5>
          NEXT STEPS FOR <CommentUser pubkey={$currentUser.pubkey} />
        </h5>
        <p>
          It looks like you solved this problem, which means you can request
          Merits for your work.
        </p>
        <br />
        <p>
          Merits are how we represent the relative value of everyone's
          contribution to a Rocket. If the Rocket produces revenue, this revenue
          goes directly to Merit Holders.
        </p>
        <hr />
        <h4>What is the value of your work?</h4>
        <NumberInput
          invalid={!validateAmount(meritRequest.amount)}
          hideSteppers
          label="Amount (sats)"
          bind:value={meritRequest.amount}
        />
        {#if meritRequest.amount > 0 && cuckPrice}<p>
            Approximately <span style="font-weight: bold;"
              >${((meritRequest.amount / 100000000) * cuckPrice).toFixed(
                2
              )}</span
            > in cuckbucks.
          </p>{/if}
        <ExpandableTile>
          <div slot="above">
            <h6>What amount should I claim?</h6>
          </div>
          <div slot="below">
            <p>
              Merit requests are public, everyone can see and judge if the
              amount you are claiming matches the work done (and your level of
              competence). It's also an indication of your efficiency; other
              people in nostr the community who may be looking to hire someone
              to help with their project can see your track record.
            </p>
            <br />
            <p>
              If you've done freelance work in the past then you know your
              hourly rate, so just multiply this by how much time you spent
              solving this problem. If you're unsure of how much you should
              claim, you should ask <CommentUser pubkey={rocket.CreatedBy} /> or
              others in the community for advice.
            </p>
          </div>
        </ExpandableTile>

        <br />
        <h4>Do you want Sats instead of Merits</h4>
        <Checkbox
          labelText="I want Sats for this particular Merit Request. I do not want Merits. Please tell potential sponsors that they can have my Merits if they sponsor me."
          bind:checked={meritRequest.sats}
        />
        {#if meritRequest.sats}
          <TextInput
            invalid={!validate(meritRequest.onchain)}
            labelText="Bitcoin Address"
            bind:value={meritRequest.onchain}
          />
          {#if validate(meritRequest.onchain)}
            <TextInput
              invalid={!validateLud16(meritRequest.lud16)}
              labelText="Lightning Address (LUD16) [OPTIONAL]"
              placeholder="LUD16 IS COMING SOON! ONLY ON-CHAIN SUPPORTED RIGHT NOW"
              bind:value={meritRequest.lud16}
              disabled={true}
            />
            {#if validateLud16(meritRequest.lud16) && meritRequest.lud16.length > 0}
            <TextInput
              invalid={meritRequest.trustedZapReceiptPubkey.length != 64}
              labelText="Trusted Pubkey for Zap Receipts"
              bind:value={meritRequest.trustedZapReceiptPubkey}
              readonly={true}
            />
            <Button
              on:click={() => {
                throw new Error("implement me");
              }}>Detect Zap Receipt Pubkey</Button
            >
            {/if}
          {/if}
        {/if}
        {#if !meritRequest.sats}
          <ExpandableTile>
            <div slot="above">
              <h6>Should I choose sats instead of merits?</h6>
            </div>
            <div slot="below">
              <p>
                Merits give you ownership of the Rocket and all future revenue
                it ever generates.
              </p>
              <br />
              <p>
                You can opt to make your approved Merit Request available to
                potential sponsors. This means that a sponsor pays you for the
                work you did to solve this Problem, and they will receive your
                Merits.
              </p>
            </div>
          </ExpandableTile>
        {/if}
        <Button on:click={publshMeritRequest} icon={ArrowRight} disabled={!canSubmit}>PUBLISH</Button>
      </Tile>
    </Column>
  </Row>
{/if}

{#if published}
<InlineNotification kind="success" title="SUCCESS" subtitle="Your Merit Request has been published."/>
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
