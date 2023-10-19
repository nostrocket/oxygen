# oxygen

Problem: spaceman is not maintainable and it's getting annoying

```
npm install
npm run dev
```


## Terminology
**note**: a nostr event.  

**State Change Request**: a *note* requesting a change to the current nostrocket state, for example a Merit Request, logging a Problem, adding a pubkey to the Identity Tree, etc.  

**Consensus Chain**: a linked list of notes called [Consensus Events](https://github.com/nostrocket/NIPS/blob/main/Rockets.md#consensus-event). Each note in the list points (with a labelled `e` tag) to at least one *State Change Request*. We build our local state by parsing these State Change Requests against the Nostrocket Unprotocol.

**Hard State**: this is the state which exists as a [Consensus Chain](https://github.com/nostrocket/NIPS/blob/main/Rockets.md#consensus-over-state) and SHOULD be eventually consistent across all participant's instances of a Rocket. 

A *State Change Request* that indends to modify *Hard State* only does so when someone with *Votepower* within that particular Rocket includes it in their *Consensus Chain*. 

This type of state should be used sparingly. Any state that doesn't require a high degree of consensus among participants should *not* use Hard State. 

Hard State is currently used for state that is in the critical path to Votepower: Rocket creation; Merit requests, votes on merit requests, transfer of merits to other pubkeys.  

**Soft State**: There is no consensus over this state and it is not included in a Consensus Chain, but it can be considered *eventually consistent enough* for most nostrocket activity. Examples of where it's currently used: Identity Tree, Problem Tracker (logging new problems, modifying problems, etc).  

**Session State**: This is for convenience only, it is local to the browser and not persisted as notes. The only current example of this in nostrocket is the current user's profile, which we use for producing notes etc.


### How it fits together
All Nostrocket notes SHOULD point to `note1r0cketrztzx06l3uxd4c2j86fxsfvfls8klsd3aylm38hsqewtyqyp7wj7` so they can be found easily.

Hard State begins with a `kind 15171031` [Rocket Ignition Event](https://github.com/nostrocket/NIPS/blob/main/Rockets.md). Nostrocket itself is a Rocket created by one of these events.

The pubkey that signs a Rocket Ignition Event is called the *Ignition Pubkey*. The Ignition Pubkey that creates a new Rocket always begins with a Votepower of `1` (only applicable within that particular Rocket). 

As the Ignition Pubkey is the only pubkey with Votepower when a new Rocket is created, anyone wanting to view the current Hard State for that particular Rocket should begin by following this pubkey's Consensus Chain, adding and removing further pubkeys along the way as the state of the Rocket changes (the client does this automagically). For additional mallorysistance, users can add their Bitcoin node details to validate OP_RETURNS signed by pubkeys with votepower.

Before adding State Change Requests to their Consensus Chain, a pubkey with votepower MUST validate the request against the Nostrocket Unprotocol within the context of the current global Hard State AND their current subjective view of Soft State. thus, while there's no consensus over Soft State, it's still somewhat relevant (but not critical) to consensus over Hard State. 

