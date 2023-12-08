import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { ignitionPubkey, rootEventID } from "../../../settings";

export class Nostrocket {
  Problems: Map<string, Problem>;
  RocketMap: Map<string, Rocket>; //{ [p: RocketID]: Rocket };
  ConsensusEvents: string[];

  constructor() {
    this.ConsensusEvents = [rootEventID];
    this.RocketMap = new Map();
    this.Problems = new Map();
    let j: any;
  }
  LastConsensusEvent(): string {
    if (this.ConsensusEvents.length < 1) {
      throw new Error("Method not implemented.");
    }
    return this.ConsensusEvents[this.ConsensusEvents.length - 1];
  }

  Copy(): Nostrocket {
    let copy = new Nostrocket();
    copy.Problems = new Map(this.Problems);
    copy.RocketMap = new Map(this.RocketMap);
    for (let e of this.ConsensusEvents) {
      if (!copy.ConsensusEvents.includes(e)) {
        copy.ConsensusEvents.push(e);
      }
    }
    return copy;
  }
}

export class Rocket {
  UID: string;
  Name: string;
  CreatedBy: string;
  ProblemID: string;
  MissionID: string;
  Maintainers: Map<Account, Account[]>;
  Merits: { [key: string]: Merit };
  Events: Set<string>;
  Event:NostrEvent;
  Participants: Map<Account, Account[]>;
  RequiresConsensus:boolean;
  Problems:Set<string>
  Mission:string;
  MeritMode: string; //pleb mode or dictator mode
  Repositories: Set<URL>;
  constructor() {
    this.Maintainers = new Map<Account, Account[]>();
    this.Participants = new Map<Account, Account[]>();
    this.Repositories = new Set();
    this.Problems = new Set();
    this.Events = new Set();
  }

  isParticipant(pubkey: string): boolean {
    if (this.CreatedBy == pubkey) {
      return true
    }
    if (this.Participants.has(pubkey)) {
      return true
    }
    for (let [inviter, invitees] of this.Participants) {
      if (inviter == pubkey) {return true}
      for (let invitee of invitees) {
        if (invitee == pubkey) {return true}
      }
    }
    return false
  }

  isMaintainer(pubkey: string):boolean {
    //todo DRY this
    if (pubkey == ignitionPubkey || this.CreatedBy == pubkey) {
      return true
    }
    if (this.Maintainers.has(pubkey)) {
      return true
    }
    for (let [inviter, invitees] of this.Maintainers) {
      if (inviter == pubkey) {return true}
      for (let invitee of invitees) {
        if (invitee == pubkey) {return true}
      }
    }
    return false
  }
}

export class Identity {
  Account: Account;
  CharacterVouchedForBy: Array<string>;
  LatestKind0: NostrEvent;
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

export class Problem {
  UID: ProblemID;
  Parents: Set<string>;
  Title: string;
  Summary: string;
  FullText: string;
  ClaimedAt: number;
  ClaimedBy: Account;
  CreatedBy: Account;
  Rocket: RocketID;
  Status: string;
  LastUpdateHeight: number;
  LastUpdateHash: string;
  LastUpdateUnix: number;
  Children: Set<string>;
  Events: NostrEvent[];
  Depth:number;
  constructor() {
    this.Parents = new Set<string>();
    this.Children = new Set<string>();
    this.Events = [];
    this.Status = "open"
  }
  Copy():Problem {
    let copy = new Problem()
    for (let p of this.Parents) {
      copy.Parents.add(p)
    }
    for (let p of this.Children) {
      copy.Children.add(p)
    }
    for (let e of this.Events) {
      copy.Events.push(e)
    }
    copy.UID = this.UID;
    copy.Title = this.Title;
    copy.Summary = this.Summary;
    copy.FullText = this.FullText;
    copy.ClaimedAt = this.ClaimedAt;
    copy.ClaimedBy = this.ClaimedBy;
    copy.CreatedBy = this.CreatedBy;
    copy.Rocket = this.Rocket;
    copy.Status = this.Status;
    copy.LastUpdateHeight = this.LastUpdateHeight;
    copy.LastUpdateHash = this.LastUpdateHash;
    copy.LastUpdateUnix = this.LastUpdateUnix;
    return copy
  }
}

export class Merit {
  Requests: { [key: EventID]: MeritRequest };
}

export class MeritRequest {
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
export type ProblemStatus =
  | "open"
  | "claimed"
  | "closed"
  | "patched"
  | "all"
  | "actionable"
export type RocketID = EventID; //rocketID in hex
export type Sha256 = string;
