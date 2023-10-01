import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type NDKTag from "@nostr-dev-kit/ndk";
import { ignitionEvent, ignitionPubkey, rocketNameValidator } from "./settings";

export interface Nostrocket {
  Accounts: Account[];
  IdentityList: Identity[];
  IdentityMap: Map<string, Identity>;
  Replay: { [key: Account]: EventID };
  Rockets: Rocket[];
  RocketMap: Map<string, Rocket>//{ [key: RocketID]: Rocket };
  Problems: { [key: ProblemID]: Problem };
  LastConsensusEvent(): string;
  ConsensusEvents: string[];
  HandleStateChangeEvent(ev:NDKEvent): [boolean, Nostrocket]
  //Parse(input: string) :Nostrocket
}

function consensusEvent(ev: NDKEvent, state: Nostrocket): [boolean, Nostrocket] {
  console.log(state)
return [false, state]
}

export function nameIsUnique(name: string, state: Nostrocket):boolean {
  //validate that name doesn't already exist
  state.RocketMap.forEach(r => {
    if (!notEqual(r.Name, name)) {return false}
  })
  state.IdentityMap.forEach(i => {
    if (!notEqual(i.Name, name)) {return false}
  })
  return true
}

function notEqual(a: string, b:string):boolean {
  if (a == b) {
    return true
  }
  if (a.toUpperCase() == b.toUpperCase()) {
    return true
  }
  return false
}

function rocketIgnitionEvent(ev: NDKEvent, state: Nostrocket): [boolean, Nostrocket] {
  //todo valide identity tree etc
  let nameTag = ev.getMatchingTags("n")[0]
  if (nameTag) {
    let name = nameTag[1]
    if (name) {
      if (!rocketNameValidator.test(name)) {return [false, state]};
      if (!nameIsUnique(name, state)) {return [false, state]};
      let r: rocket = new rocket(undefined);
      let problem = ev.getMatchingTags("a")[0]
      let problemStr: string | undefined
      if (problem) {
        if (problem[1]) {
          let [id, pubkey, dtag] = problem[1].split(':')
          if (id && pubkey && dtag) {
            if (pubkey !== ev.pubkey) {
              console.log(ev.pubkey + " is attempting to create a rocket based on a problem logged by " + pubkey)
              return [false, state]
            }
            problemStr = problem[1]
          }
        }
      }
      r.fromEvent(ev, name, problemStr)
        state.RocketMap.set(r.UID, r)
        return [true, state]
    }
  }
  console.log(state)
return [false, state]
}

export default class State implements Nostrocket {
  Accounts: Account[];
  IdentityList: Identity[];
  IdentityMap: Map<string, Identity>;
  Problems: { [p: ProblemID]: Problem };
  Replay: { [p: Account]: EventID };
  RocketMap: Map<string, Rocket>//{ [p: RocketID]: Rocket };
  Rockets: Rocket[];
  ConsensusEvents: string[];
  HandleStateChangeEvent = function(ev: any): [boolean, Nostrocket] {
    if (!ev.pubkey) {
      return [false, this]
    }
    let result: boolean = false;
    let newstate: Nostrocket;
    switch (ev.kind) {
      case 15172008: //consensus event
        [result, newstate] = consensusEvent(ev, this)
        break;
      case 15171031: //new rocket event
        [result, newstate] = rocketIgnitionEvent(ev, this)
        break;
      default:
        console.log(ev.kind)
        console.log("HANDLING OF "+ev.kind+" NOT IMPLEMENTED")
    }
    if (result) {
      return [true, this]
    }
    return [false, this]
  }

  constructor(input: string) {
    this.ConsensusEvents = [ignitionEvent];
    this.IdentityList = [];
    this.IdentityMap = new Map();
    this.Accounts = [];
    this.RocketMap = new Map();
    this.Rockets = [];
    let j: any;
    if (!this.IdentityMap.get(ignitionPubkey)){
      this.IdentityMap.set(ignitionPubkey, new identity({
        Account: ignitionPubkey,
        Name: "Ignition Account",
        MaintainerBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
        Order: 0,
        UniqueSovereignBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww"
      }))
    }
    try {
      j = JSON.parse(input);
      try {
        if (j.HEAD) {
          this.LastConsensusEvent = j.HEAD
        }
        Object.keys(j.identity).forEach((i) => {
          //console.log(j.identity[i])
          let id = new identity(j.identity[i]);
          this.IdentityMap.set(id.Account, id)//[id.Account] = id;
          this.IdentityList.push(id);
          //console.log(id)
        });
        this.IdentityList.sort((a, b) => b.Order - a.Order);
        for (let key in this.IdentityMap) {
          this.Accounts.push(key);
        }
      } catch {
        console.log("did not find identities in: "+ input);
      }
      try {
        Object.keys(j.rockets).forEach((i) => {
          let r = new rocket(j.rockets[i]);
          this.RocketMap.set(r.UID, r)
          this.Rockets.push(r);
        });
      } catch {
        console.log("did not find rockets in: "+ input);
      }
    } catch {
      console.log("failed to parse: "+ input);
    }
  }
  LastConsensusEvent(): string {
    if (this.ConsensusEvents.length < 1) {throw new Error("Method not implemented.")}
    return this.ConsensusEvents[this.ConsensusEvents.length-1]
  }
  
}

class rocket implements Rocket {
  UID: string;
  Name: string;
  CreatedBy: string;
  ProblemATag: string;
  MissionID: string;
  Maintainers: string[];
  Merits: { [key: string]: Merit };
  Event: NDKEvent;
  constructor(input: any | undefined) {
    if (input) {
      this.UID = input.RocketUID;
      this.Name = input.RocketName.replace(/^./, input.RocketName[0].toUpperCase())
      this.CreatedBy = input.CreatedBy;
      this.MissionID = input.MissionID;
    }
  }
  fromEvent(input: NDKEvent, name: string, problem: string | undefined) {
    this.UID = input.id;
    this.Name = name;
    this.CreatedBy = input.pubkey;
    this.Maintainers = [input.pubkey]
    this.ProblemATag = problem ? problem: ""
    this.Event = input
  }

}

class identity implements Identity {
  Account: Account;
  CharacterVouchedForBy: Array<string>;
  LatestKind0: NDKEvent;
  MaintainerBy: string;
  Name: string;
  OpReturnAddr: Array<string>;
  Order: number;
  PermanymEventID: string;
  Pubkeys: Array<string>;
  UniqueSovereignBy: string;

  constructor(input: any) {
    this.Account = input.Account;
    this.Name = input.Name;
    this.MaintainerBy = input.MaintainerBy;
    this.Order = input.Order;
    this.UniqueSovereignBy = input.UniqueSovereignBy;
  }
}

export interface Problem {
  UID: ProblemID;
  Parent: ProblemID;
  Title: string;
  Body: string;
  Closed: boolean;
  ClaimedAt: bigint;
  ClaimedBy: Account;
  CreatedBy: Account;
  Rocket: RocketID;
  Tags: Array<NDKTag>;
}

export interface Identity {
  Account: Account;
  Name: string;
  UniqueSovereignBy: string;
  CharacterVouchedForBy: Array<string>;
  MaintainerBy: string;
  Pubkeys: Array<string>;
  OpReturnAddr: Array<string>;
  Order: number;
  PermanymEventID: string;
  LatestKind0: NDKEvent;
  //Parse(input: any): Identity
}

export interface Rocket {
  UID: RocketID;
  Name: string;
  CreatedBy: Account;
  ProblemATag: EventID;
  MissionID: EventID;
  Maintainers: Array<Account>;
  Merits: { [key: Account]: Merit };
  Event: NDKEvent;
}



export interface Merit {
  Requests: { [key: EventID]: MeritRequest };
}

export interface MeritRequest {
  UID: EventID;
  LtLocked: boolean;
  OwnedBy: Account;
  CreatedBy: Account;
  Problem: ProblemID;
  CommitMsg: string;
  SolutionMsg: string;
  PatchHash: Sha256;
  Amount: bigint;
  RemuneratedAmount: bigint;
  DividendAmount: bigint;
  WitnessedAt: bigint;
  Nth: bigint;
  Ratifiers: { [key: Account]: bigint };
  RatifyPermille: bigint;
  Blackballers: { [key: Account]: bigint };
  BlackballPermille: bigint;
  Approved: boolean;
  Rejected: boolean;
  MeritsCreated: bigint;
}

export type Account = Sha256; //pubkey in hex
export type EventID = Sha256;
export type ProblemID = EventID;
export type RocketID = EventID; //rocketID in hex
export type Sha256 = string;
