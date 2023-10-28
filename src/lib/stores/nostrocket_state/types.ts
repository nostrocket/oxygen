import {
  rootEventID,
  ignitionPubkey,
  rocketNameValidator,
  nostrocketIgnitionEvent,
} from "../../../settings";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import type NDKTag from "@nostr-dev-kit/ndk";
import { nameIsUnique } from "./hard_state/rockets";

export interface Nostrocket {
  Accounts: Account[];
  IdentityList: Identity[];
  IdentityMap: Map<string, Identity>;
  Replay: { [key: Account]: EventID };
  Rockets: Rocket[];
  RocketMap: Map<string, Rocket>; //{ [key: RocketID]: Rocket };
  Problems: Map<string, Problem>;
  LastConsensusEvent(): string;
  ConsensusEvents: string[];
  HandleStateChangeEvent(ev: NDKEvent): [Nostrocket, boolean];
  HandleLightStateChangeEvent(ev: NDKEvent): [Nostrocket, boolean];
  //Parse(input: string) :Nostrocket
}

function newProblemHeadEvent(
  ev: NDKEvent,
  state: Nostrocket
): [Nostrocket, boolean] {
  let success = false;
  ev.getMatchingTags("e").forEach((t) => {
    if (t[t.length - 1] == "anchor") {
      if (t[1].length == 64) {
        let current = state.Problems?.get(t[1]);
        if (current) {
          let authorized = current.CreatedBy == ev.pubkey;
          if (!authorized && current.Rocket) {
            let r = state.RocketMap.get(current.Rocket);
            if (r) {
              if (r.Maintainers.get(ev.pubkey)) {
                authorized = true;
              }
            }
          }
          if (authorized) {
            let later = false;
            if (current.Head) {
              later = ev.created_at > current.Head.created_at;
            } else {
              later = true;
            }
            if (later) {
              let [updated, ok] = updateProblemWithNewHead(current, ev, state);
              success = ok;
              if (ok) {
                state.Problems.set(t[1], updated);
                return [state, true];
              }
            }
          }
        }
      }
    }
  });
  return [state, success];
}

function updateProblemWithNewHead(
  current: Problem,
  h: NDKEvent,
  state: Nostrocket
): [Problem, boolean] {
  let p = structuredClone(current);
  p.Head = h;
  p.Head.getMatchingTags("s").forEach((s) => {
    if (s[1].length > 0) {
      if (
        s[1] == "open" ||
        s[1] == "closed" ||
        s[1] == "claimed" ||
        s[1] == "patched" ||
        s[1] == "solved"
      ) {
        p.Status = s[1];
      }
    }
  });
  p.Head.getMatchingTags("h").forEach((h) => {
    if (h[1].includes(":")) {
      let hs = h[1].split(":");
      let height = parseInt(hs[0], 10);
      if (height) {
        p.LastHeadHeight = height;
      }
      if (hs[1].length == 64) {
        p.LastHeadHash = hs[1];
      }
    }
  });
  p.Head.getMatchingTags("e").forEach((e) => {
    if (e[e.length - 1] == "parent") {
      if (e[1].length == 64) {
        if (!p.Parents) {
          p.Parents = new Set();
        }
        p.Parents.add(e[1]);
      }
    }
    if (e[e.length - 1] == "commit") {
      if (e[1].length == 64) {
        p.LastCommit = e[1];
      }
    }
    if (e[e.length - 1] == "rocket") {
      if (e[1].length == 64) {
        if (p.Rocket !== e[1]) {
          let r = state.RocketMap.get(e[1]);
          if (r) {
            //todo make sure that when we add maintainers, we are creating keys for each person added in the event
            if (
              r.Maintainers.get(h.pubkey) ||
              e[1] == nostrocketIgnitionEvent
            ) {
              p.Rocket = e[1];
            }
          }
        }
      }
    }
  });
  if (p.Parents) {
    p.Parents.forEach((prnt) => {
      let parentProblem = state.Problems.get(prnt);
      if (parentProblem) {
        if (!parentProblem.Children) {
          parentProblem.Children = new Set();
        }
        parentProblem.Children.add(p.UID);
      }
    });
  }
  if (!p.Rocket) {
    p.Rocket = nostrocketIgnitionEvent;
  }
  let success = true;
  if (p.LastCommit && p.LastHeadHash && p.LastHeadHeight && p.Status) {
    if (
      !(
        p.Rocket !== current.Rocket ||
        p.Status !== current.Status ||
        p.LastCommit !== current.LastCommit
      )
    ) {
      success = false;
    }
  } else {
    success = false;
  }
  //validate the problem has changed, and that the changes are valid
  return [p, success];
}

function newProblemAnchorEvent(
  ev: NDKEvent,
  state: Nostrocket
): [Nostrocket, boolean] {
  let success = false
  if (!state.Problems) {
    state.Problems = new Map<string, Problem>();
  }
  if (!state.Problems.get(ev.id)) {
    if (
      state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)
    ) {
      let p = new Problem();
      if (p.modifyState(ev)) {
        state.Problems.set(p.UID, p);
        success = true
      }
    }
  }
  return [state, success];
}

function consensusEvent(
  ev: NDKEvent,
  state: Nostrocket
): [boolean, Nostrocket] {
  console.log(state);
  return [false, state];
}


function rocketIgnitionEvent(
  ev: NDKEvent,
  state: Nostrocket
): [Nostrocket, boolean] {
  //todo valide identity tree etc
  let nameTag = ev.getMatchingTags("n")[0];
  if (nameTag) {
    let name = nameTag[1];
    if (name) {
      //validate regex
      if (!rocketNameValidator.test(name)) {
        return [state, false];
      }
      if (!nameIsUnique(name, state)) {
        return [state, false];
      }
      let r: Rocket = new Rocket();
      let problem = ev.getMatchingTags("a")[0];
      let problemStr: string | undefined;
      if (problem) {
        if (problem[1]) {
          let [id, pubkey, dtag] = problem[1].split(":");
          if (id && pubkey && dtag) {
            if (pubkey !== ev.pubkey) {
              console.log(
                ev.pubkey +
                  " is attempting to create a rocket based on a problem logged by " +
                  pubkey
              );
              return [state, false];
            }
            problemStr = problem[1];
          }
        }
      }
      r.fromEvent(ev, name, problemStr);
      state.RocketMap.set(r.UID, r);
      return [state, true];
    }
  }
  return [state, false];
}

export class Nostrocket implements Nostrocket {
  Accounts: Account[];
  IdentityList: Identity[];
  IdentityMap: Map<string, Identity>;
  Problems: Map<string, Problem>;
  Replay: { [p: Account]: EventID };
  RocketMap: Map<string, Rocket>; //{ [p: RocketID]: Rocket };
  Rockets: Rocket[];
  ConsensusEvents: string[];
  HandleLightStateChangeEvent = (ev: NDKEvent): [Nostrocket, boolean] => {
    switch (ev.kind) {
      case 15171971: //Problem ANCHOR event
        return newProblemAnchorEvent(ev, this);
      case 31971:
        return newProblemHeadEvent(ev, this);
      default:
        console.log(ev.kind);
        console.log("HANDLING OF " + ev.kind + " NOT IMPLEMENTED");
    }
    return [this, false];
  };
  HandleStateChangeEvent = function (ev: NDKEvent): [Nostrocket, boolean] {
    let result: boolean = false;
    let newstate: Nostrocket;
    switch (ev.kind) {
      // case 15172008: //consensus event
      //   return consensusEvent(ev, this);
      //   break;
      case 15171031: //new rocket event
        return rocketIgnitionEvent(ev, this);
      default:
        console.log(ev.kind);
        console.log("HANDLING OF " + ev.kind + " NOT IMPLEMENTED");
    }
    return [this, false];
  };

  constructor(input: string) {
    this.ConsensusEvents = [rootEventID];
    this.IdentityList = [];
    this.IdentityMap = new Map();
    this.Accounts = [];
    this.RocketMap = new Map();
    this.Rockets = [];
    this.Problems = new Map();
    let j: any;
    if (!this.IdentityMap.get(ignitionPubkey)) {
      this.IdentityMap.set(
        ignitionPubkey,
        new identity({
          Account: ignitionPubkey,
          Name: "Ignition Account",
          MaintainerBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
          Order: 0,
          UniqueSovereignBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
        })
      );
    }
    try {
      j = JSON.parse(input);
      try {
        if (j.HEAD) {
          this.LastConsensusEvent = j.HEAD;
        }
        Object.keys(j.identity).forEach((i) => {
          //console.log(j.identity[i])
          let id = new identity(j.identity[i]);
          this.IdentityMap.set(id.Account, id); //[id.Account] = id;
          this.IdentityList.push(id);
          //console.log(id)
        });
        this.IdentityList.sort((a, b) => b.Order - a.Order);
        for (let key in this.IdentityMap) {
          this.Accounts.push(key);
        }
      } catch {
        //console.log("did not find identities in: "+ input);
      }
      try {
        Object.keys(j.rockets).forEach((i) => {
          let r = new rocket(j.rockets[i]);
          this.RocketMap.set(r.UID, r);
          this.Rockets.push(r);
        });
      } catch {
        //console.log("did not find rockets in: "+ input);
      }
    } catch {
      //console.log("failed to parse: "+ input);
    }
  }
  LastConsensusEvent(): string {
    if (this.ConsensusEvents.length < 1) {
      throw new Error("Method not implemented.");
    }
    return this.ConsensusEvents[this.ConsensusEvents.length - 1];
  }
}

export class Rocket implements Rocket {
  UID: string;
  Name: string;
  CreatedBy: string;
  ProblemID: string;
  MissionID: string;
  Maintainers: Map<Account, Account[]>;
  Merits: { [key: string]: Merit };
  Event: NDKEvent;
  Participants: Map<Account, Account[]>;
  constructor() {
    this.Maintainers = new Map<Account, Account[]>();
    this.Participants = new Map<Account, Account[]>();
  }
  fromEvent(input: NDKEvent, name: string, problem: string | undefined) {
    this.UID = input.id;
    this.Name = name;
    this.CreatedBy = input.pubkey;
    this.Participants = new Map<Account, Account[]>();
    this.Participants.set(this.CreatedBy, []);
    if (!this.Maintainers) {
      this.Maintainers = new Map<Account, Account[]>();
    }
    this.Maintainers.set(input.pubkey, []);
    this.ProblemID = problem ? problem : "";
    this.Event = input;
  }

  updateParticipants(input: NDKEvent): boolean {
    if (input.kind == 30000) {
      if (this.isParticipant(input.pubkey)) {
        let list: Array<Account> = [];
        input.getMatchingTags("p").forEach((pk) => {
          if (pk[1]) {
            if (pk[1].length == 64) {
              list.push(pk[1]);
            }
          }
        });
        if (list.length > 0) {
          this.Participants.set(input.pubkey, list);
          return true;
        }
      }
    }
    return false;
  }

  isParticipant(pubkey: string): boolean {
    let valid = false;
    if (this.Participants.has(pubkey)) {
      valid = true;
    }
    this.Participants.forEach((x) => {
      x.forEach((y) => {
        if (y == pubkey) {
          valid = true;
        }
      });
    });
    return valid;
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

export class Problem implements Problem {
  modifyState(e: NDKEvent): boolean {
    if (e.kind == 15171971) {
      if (this.UID?.length !== 64) {
        this.UID = e.id;
        this.CreatedBy = e.pubkey;
        return true;
      }
    }
    return false;
  }
  constructor() {}
}

export interface Problem {
  UID: ProblemID;
  Parents: Set<string>;
  Title: string;
  Summary: string;
  FullText: string;
  Closed: boolean;
  ClaimedAt: bigint;
  ClaimedBy: Account;
  CreatedBy: Account;
  Rocket: RocketID;
  Tags: Array<NDKTag>;
  Head: NDKEvent;
  Status: string;
  LastHeadHeight: number;
  LastHeadHash: string;
  LastCommit: string;
  CommitHistory: string[];
  Children: Set<string>;
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
  ProblemID: EventID;
  MissionID: EventID;
  Maintainers: Map<Account, Account[]>;
  Participants: Map<Account, Account[]>;
  Merits: { [key: Account]: Merit };
  Event: NDKEvent;
  isParticipant(pubkey: string): boolean;
  updateParticipants(input: NDKEvent): boolean;
  fromEvent(input: NDKEvent, name: string, problem: string | undefined): void;
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
