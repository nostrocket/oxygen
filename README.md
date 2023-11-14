# oxygen

Problem: spaceman is not maintainable and it's getting annoying

```
npm install
npm run dev
```

## Contributing

Avoid ambiguity over Types: use TypeScript, avoid any use of plain untyped JS.

When solving a problem with a patch, DO NOT run any form of linting on any code that you have not directly modified. DO NOT change the existing white spacing on lines that you have not modified in some other way. The default assumption for pull requests that contain whitespace changes etc on lines that are otherwise unchanged is that you are doing this to obfuscate the introduction of malicious code elsewhere by introducing a sea of changes that do not directly address the stated problem.  

If you think vast swathes of code are poorly formatted, this MUST be solved in its own patch, and not mixed in together with the solution to some other problem. Patches to solve problems with formatting MUST NOT contain any code changes, if they do, they will be rejected.

## Terminology

**note**: a nostr event.

**State Change Request**: a _note_ requesting a change to the current nostrocket state, for example a Merit Request, logging a Problem, adding a pubkey to the Identity Tree, etc.

**Consensus Chain**: a linked list of notes called [Consensus Notes](https://github.com/nostrocket/NIPS/blob/main/Rockets.md#consensus-event). Each note in the list points (with a labelled `e` tag) to at least one _State Change Request_. We build our local state by parsing these State Change Requests against the Nostrocket Unprotocol.

**Hard State**: this is the state which exists as a [Consensus Chain](https://github.com/nostrocket/NIPS/blob/main/Rockets.md#consensus-over-state) and SHOULD be eventually consistent across all participant's instances of a Rocket.

A _State Change Request_ that indends to modify _Hard State_ only does so when someone with _Votepower_ within that particular Rocket includes it in their _Consensus Chain_.

This type of state should be used sparingly. Any state that doesn't require a high degree of consensus among participants should _not_ use Hard State.

Hard State is currently used for state that is in the critical path to Votepower: Rocket creation; Merit requests, votes on merit requests, transfer of merits to other pubkeys.

**Hard State Change Request** is a _State Change Request_ intended to modify _Hard State_.

**Soft State**: There is no consensus over this state and it is not included in a Consensus Chain, but it can be considered _eventually consistent enough_ for most nostrocket activity. Examples of where it's currently used: Identity Tree, Problem Tracker (logging new problems, modifying problems, etc).

**Soft State Change Request** is a _State Change Request_ intended to modify _Soft State_.

**Session State**: This is for convenience only, it is local to the browser and not persisted as notes. The only current example of this in nostrocket is the current user's profile, which we use for producing notes etc.

## How it fits together

All Nostrocket notes SHOULD point to `note1r0cketrztzx06l3uxd4c2j86fxsfvfls8klsd3aylm38hsqewtyqyp7wj7` so they can be found easily.

Hard State begins with a `kind 15171031` [Rocket Ignition Event](https://github.com/nostrocket/NIPS/blob/main/Rockets.md). Nostrocket itself is a Rocket created by one of these events.

The pubkey that signs a Rocket Ignition Event is called the _Ignition Pubkey_. The Ignition Pubkey that creates a new Rocket always begins with a Votepower of `1` (only applicable within that particular Rocket).

As the Ignition Pubkey is the only pubkey with Votepower when a new Rocket is created, anyone wanting to view the current Hard State for that particular Rocket should begin by following this pubkey's Consensus Chain, adding and removing further pubkeys along the way as the state of the Rocket changes (the client does this automagically). For additional mallorysistance, users can add their Bitcoin node details to validate OP_RETURNS signed by pubkeys with votepower.

Before adding State Change Requests to their Consensus Chain, a pubkey with votepower MUST validate the request against the Nostrocket Unprotocol (encoded into Oxygen logic) within the context of the current global Hard State AND their current subjective view of Soft State.

Thus, while there's no consensus over Soft State, it's still somewhat relevant (but not critical) to consensus over Hard State.

Soft State is simply updated by Soft State Change Requests if they pass local validation after being received from a Relay. This validation can involve validation against the Nostrocket Unprotocol, the current Hard and Soft state, and user settings.

## Note Sources and Routing

Everything in Oxygen is _Note driven_. These notes come from relays, and are handled differently depending on whether they are _Consensus Notes_, _Hard State Change Requests_, or _Soft State Change Requests_.

First, we subscribe to all Relays using all relevant filters. Then we buffer, route, and handle the incoming notes appropriately.

We take the stream of notes from our Relays, filter out anything that doesn't look valid, and buffer the result in mempool.

### Hard State

We listen to the mempool for any valid Consensus Notes (signed by a pubkey with votepower in our current Hard State AND points to that pubkey's last Consensus Note for that particular Rocket). We find the Hard State Change Request that this Consensus Note has included in an `e` tag with the label `request`, and then we fetch that Note from mempool (it SHOULD be in mempool). We handle that Hard State Change Request. If it fails, we halt and catch fire. If the currently logged in user has votepower, we publish Consensus Events to add these Hard State Change Events to our own Consensus Chain at this time.

We keep repeating this until there are no new Consensus Notes. Each pubkey can also publish their latest Consensus Note ID and height in a replaceable event so that we know when we've reached the tip. We keep listening for these Consensus Notes and handle them whenever they come in.

The **Consensus Lead** is the pubkey with the highest Votepower from the set of all pubkeys that are currently online for a given Rocket (we use ephemeral notes to inform others that we are currently active).

If we (the currently logged in user) has the Consensus Lead, then once we've reached the current tip of a valid Consensus Chain, we start producing Consensus Events to add any waiting Hard State Change Requests (in mempool) to our Consensus Chain (after validating them of course). We do not update our local state directly during this process, we instead wait for our own Consensus Notes to arrive from a Relay and handle them as per the above. This is to keep the logic all in the same place and make things more simple.

### Soft State

We can handle Soft State Change Requests asynchronously in the background at the same time as Hard State Change Requests.

We listen to mempool for all seeminlgy valid Soft State Change Requests, and simply handle them by validating them against the Nostrocket Unprotocol in the context of the current Hard and Soft state.

### Best Practices

- If a Note sucessfully causes any kind of State to change, remove it from our mempool, and add it to a list (or cuckoo filter) of notes that have been handled, so that we don't handle them more than once.
