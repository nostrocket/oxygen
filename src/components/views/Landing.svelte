<script>
  import { base } from "$app/paths";
  import { makeHtml } from "$lib/helpers/mundane";
  import { n0 } from "$lib/snippets/landing";
    import { Column, ImageLoader, Row, Tile } from "carbon-components-svelte";
  </script>
<h1>Nostrocket!</h1>
<Row>
    <Column>
        <Row>
            <Tile>
                <h3>New territories of <span class="bolditalic">freedom</span></h3>
                <p>Nostrocket uses Bitcoin and the nostr to coordinate leaderless and location-independent Bitcoin-based economies that sustainably reward productive solutions to shared problems facing humanity.</p>
                <br />
                <p>This economic tool allows contributors to stop fiat mining and follow their passion in a way that directly contributes to an improvement in the human condition for themselves and all of humanity by solving problems in the critical path towards a Bitcoin standard with nostr as humanity’s social graph.</p>
            </Tile>
        </Row>
        <br />
        <Row>
            <Tile>
                <h3>How it works</h3>
                <p>Participants use their nostr identity to log problems (observed matters or situations regarded as unsatisfactory) in a global problem tree starting with the root problem: <a href="{base}/problems/3b8e916d6b681363405fe6c493445403220fa4c41b737b6a78a8e2482a16fc18">Humanity is not living up to its full potential.</a></p>
                <br />
                <p>Problems become broken down into leaf nodes that are granular and solveable, e.g. “this button doesn’t work”. Any participant may then claim and solve it.</p>
                <br />
                <p>Once solved, a merit request may be proposed by the solver for an amount of merits that reflects their work; all participants may vote (in proportion to the merits they have) to approve or reject the merit request. If approved, the merit pool is diluted by the solver’s new merits. Merits are the canonical representation of the total value of all contributions to a Rocket.</p>
                <br />
                <p>When the aggregate result of many small problems/solutions yields a useful product or service that earns revenue in the free market (read more about how this works at nostrocket.org), the payments for these products/services go directly to merit holders via their Bitcoin or Lightning addresses (in proportion to their merits). There’s no middle man as in legacy organisations, your work rewards you directly if the project is beneficial to others. Nostrocket is totally non-custodial and itself holds no value.</p>
                <br />
                <p>Another critical aspect of Nostrocket is different localities/communities/ideologies may fork off their own Rocket based on a branch of the problem tree. This becomes a separate Rocket with a separate merit pool, but it can be merged back into its parent Rocket at any time, giving humanity the flexibility to create citadel economies or participate in the global Nostrocket economy (which is the top level Rocket).</p>
                <br />
                <p>Critically, the direction of a Rocket is not incentivised by upfront capital raising or Cantillon power structures.</p>
                <br />
                <p>A Nostrocket client validates nostr events against the Nostrocket Unprotocol and facilitates interaction with the Unprotocol through your nostr identity. The state of Nostrocket exists entirely as nostr events. The merkle root of Nostrocket state may be checkpointed to the Bitcoin timechain by any merit-holder at any time. </p>
            </Tile>
        </Row>
        <br />
        <Row>
            <Tile>
                <h3>OXYGEN is the <span class="strikethrough">safe</span> and <span class="strikethrough">effective</span> way to use Nostrocket</h3>
                <p style="">Participants use their nostr identity to log problems (observed matters or situations regarded as unsatisfactory) in a global problem tree starting with the root problem: “Humanity is not living up to its full potential.”</p>
                <br />
                <p>Problems become broken down into leaf nodes that are granular and solveable, e.g. “this button doesn’t work”. Any participant may then claim and solve it.</p>
                <br />
                <p>Once solved, a merit request may be proposed by the solver for an amount of merits that reflects their work; all participants may vote (in proportion to the merits they have) to approve or reject the merit request. If approved, the merit pool is diluted by the solver’s new merits. Merits are the canonical representation of the total value of all contributions to a Rocket.</p>
                <br />
                <p>When the aggregate result of many small problems/solutions yields a useful product or service that earns revenue in the free market (read more about how this works at nostrocket.org), the payments for these products/services go directly to merit holders via their Bitcoin or Lightning addresses (in proportion to their merits). There’s no middle man as in legacy organisations, your work rewards you directly if the project is beneficial to others. Nostrocket is totally non-custodial and itself holds no value.</p>
                <br />
                <p>Another critical aspect of Nostrocket is different localities/communities/ideologies may fork off their own Rocket based on a branch of the problem tree. This becomes a separate Rocket with a separate merit pool, but it can be merged back into its parent Rocket at any time, giving humanity the flexibility to create citadel economies or participate in the global Nostrocket economy (which is the top level Rocket).</p>
                <br />
                <p>Critically, the direction of a Rocket is not incentivised by upfront capital raising or Cantillon power structures.</p>
                <br />
                <p>A Nostrocket client validates nostr events against the Nostrocket Unprotocol and facilitates interaction with the Unprotocol through your nostr identity. The state of Nostrocket exists entirely as nostr events. The merkle root of Nostrocket state may be checkpointed to the Bitcoin timechain by any merit-holder at any time. </p>
            </Tile>
        </Row>
        <br />
    </Column>


    <Tile><h3>The <span class="bolditalic">fastest way ever</span> to make an open source project profitable.</h3>
    <p>Nostrocket is a <a href="#">Self-Organizing Unorganization (SOU)</a> factory built with Bitcoin and Nostr. It provides a hyper-efficient and radically fair way for anyone to collaborate on open source projects for fun and profit.</p>
    <br />
<p>Nostrocket makes open source projects hyper-efficient because work can be done asynchronously without organizational mutexes. It makes them radically fair in the way that participants form consensus over the value of each contribution.</p>

<p>It makes projects rapidly profitable by providing guard rails against solving problems that are not in the critical path to more participation and revenue. It makes them perpetually sustainable in the way that they distribute project revenue to project creators, investors, and contributors.</p>
</Tile>
</Row>

<style>
.strikethrough {
    text-decoration: line-through;
}
.bolditalic {
    font-style: italic;
    font-weight: bold;
}

</style>