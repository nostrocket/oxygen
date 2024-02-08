import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { ignitionPubkey, rootEventID } from "../../../settings";
import { fuzzy } from 'fast-fuzzy';

export class Nostrocket {
  Problems: Map<string, Problem>;
  RocketMap: Map<string, Rocket>; //{ [p: RocketID]: Rocket };
  ConsensusEvents: string[];
  Mempool: Map<string, NDKEvent>;

  constructor() {
    this.Mempool = new Map()
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
  Merits: Map<string, Merit>;
  Events: Map<string, NDKEvent>;
  Participants: Map<Account, Account[]>;
  IdentityEvents: Map<Account, Set<NDKEvent>>;
  _requriesConsensus: string[];
  Problems: Set<string>;
  Mission: string;
  MeritMode: string; //pleb mode or dictator mode
  Repositories: Set<URL>;
  FAQ: Map<string, FAQ>
  REQUEST_DELETION: boolean;
  constructor() {
    this.REQUEST_DELETION = false;
    this.Name = ""
    this.Maintainers = new Map<Account, Account[]>();
    this.Participants = new Map<Account, Account[]>();
    this.IdentityEvents = new Map()
    this.Repositories = new Set();
    this.Problems = new Set();
    this.Events = new Map();
    this.Merits = new Map<string, Merit>();
    this._requriesConsensus = [];
    this.FAQ = new Map<string, FAQ>()
  }
  // MostRecentEvent():number{
  //   let latest = 0
  //   for (let [_, e] of this.Events) {
      
  //   }
  // }
  RequiresConsensusPush(e: NDKEvent) {
    if (!this._requriesConsensus.includes(e.id)) {
      this._requriesConsensus.push(e.id);
    }
  }
  RequiresConsensusPop(e: NDKEvent) {
    let newList: string[] = [];
    for (let id of this._requriesConsensus) {
      if (e.id != id) {
        newList.push(id);
      }
    }
    this._requriesConsensus = newList;
  }
  RequiresConsensus(id?: string): boolean {
    if (id) {
      return this._requriesConsensus.includes(id);
    }
    return this._requriesConsensus.length > 0;
  }

  isParticipant(pubkey: string): boolean {
    if (this.CreatedBy == pubkey) {
      return true;
    }
    if (this.Participants.has(pubkey)) {
      return true;
    }
    for (let [inviter, invitees] of this.Participants) {
      if (inviter == pubkey) {
        return true;
      }
      for (let invitee of invitees) {
        if (invitee == pubkey) {
          return true;
        }
      }
    }
    return false;
  }

  isMaintainer(pubkey: string): boolean {
    //todo: DRY this
    if (pubkey == ignitionPubkey || this.CreatedBy == pubkey) {
      return true;
    }
    if (this.Maintainers.has(pubkey)) {
      return true;
    }
    for (let [inviter, invitees] of this.Maintainers) {
      if (inviter == pubkey) {
        return true;
      }
      for (let invitee of invitees) {
        if (invitee == pubkey) {
          return true;
        }
      }
    }
    return false;
  }
  currentVotepower(): Map<string, number> {
    let votepower = new Map<string, number>();
    for (let [id, merit] of this.Merits) {
      if (merit.Ratified) {
        if (merit.LeadTime > 0) {
          let current = votepower.get(merit.OwnedBy);
          if (!current) {
            current = 0;
          }
          current += merit.LeadTime * merit.Amount;
          votepower.set(merit.OwnedBy, current);
        }
      }
    }
    let rocketCreatorVotepower = votepower.get(this.CreatedBy);
    if (!rocketCreatorVotepower) {
      votepower.set(this.CreatedBy, 1);
    }
    return votepower;
  }

  currentVotepowerForPubkey(pubkey: string): number {
    let vp = this.currentVotepower();
    let vp_pubkey = vp.get(pubkey);
    return vp_pubkey || 0;
  }
  currentTotalVotepower() {
    let total = 0
    for (let [_, vp] of this.currentVotepower()) {
      total += vp
    }
    return total
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
  Events: NostrEvent[];
  NumberOfComments:number;
  Comments:Set<string>;
  FullChildren:Set<Problem>;
  Pubkeys:Set<string>;
  RenderData: {
    grey: boolean,
    hidden: boolean,
  }
  Depth: number;
  constructor() {
    this.Title = ""
    this.Comments = new Set<string>;
    this.NumberOfComments = 0;
    this.Pubkeys = new Set<string>();
    this.Parents = new Set<string>();
    this.Events = [];
    this.Status = "open";
    this.FullChildren = new Set<Problem>();
    this.FullText = ""
    this.RenderData = {
      grey: false,
      hidden: false,
    }
  }
  TotalActivity():number {
    return this.Comments.size + this.Events.length
  }
  FullTextSearch(filter:string):number {
    let s = this.Title + " " + this.Summary + " " + this.FullText
    return fuzzy(filter, s)
  }
  Copy(): Problem {
    let copy = new Problem();
    for (let p of this.Parents) {
      copy.Parents.add(p);
    }
    for (let p of this.FullChildren) {
      copy.FullChildren.add(p);
    }
    for (let e of this.Events) {
      copy.Events.push(e);
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
    return copy;
  }
}

export class Merit {
  UID: EventID;
  OwnedBy: Account;
  CreatedBy: Account;
  Problem: ProblemID;
  Amount: number;
  RemuneratedAmount: number;
  DividendAmount: number;
  CreatedAt: Block;
  Nth: number;
  Ratifiers: Set<string>;
  RatifyPermille: number;
  Blackballers: Set<string>;
  BlackballPermille: number;
  Ratified: boolean;
  Blackballed: boolean;
  Events: Set<string>;
  _requriesConsensus: string[];
  LeadTime: number; //blocks
  LastLeadTimeAdjustment: number; //block
  RocketID: string;
  RequiresConsensusPush(e: NDKEvent) {
    if (!this._requriesConsensus.includes(e.id)) {
      this._requriesConsensus.push(e.id);
    }
  }
  RequiresConsensusPop(e: NDKEvent) {
    let newList: string[] = [];
    for (let id of this._requriesConsensus) {
      if (e.id != id) {
        newList.push(id);
      }
    }
    this._requriesConsensus = newList;
  }
  RequiresConsensus(id?: string): boolean {
    if (id) {
      return this._requriesConsensus.includes(id);
    }
    return this._requriesConsensus.length > 0;
  }

  hasVoted(pubkey?:string):boolean {
    if (pubkey) {
      if (this.Ratifiers.has(pubkey)) {return true}
      if (this.Blackballers.has(pubkey)) {return true}
    }
    return false
  }

  constructor() {
    this.Ratifiers = new Set<string>();
    this.Blackballers = new Set<string>();
    this._requriesConsensus = [];
    this.Events = new Set<string>();
  }
}

export type Vote = {
  UID: string;
  target: string;
  event: NostrEvent;
  requiresConsensus: boolean;
  direction: VoteDirection;
  permille: number;
};

export type Account = Sha256; //pubkey in hex
export type EventID = Sha256;
export type ProblemID = EventID;
export type ProblemStatus =
  | "open"
  | "claimed"
  | "closed"
  | "patched"
  | "all"
  | "actionable";
export type RocketID = EventID; //rocketID in hex
export type Sha256 = string;
export type Block = { height: number; hash: string; timestamp?: number };
export type VoteDirection = "ratify" | "blackball";

export class FAQ {
  UID: string;
  Question: string;
  AnswerSentence: string;
  AnswerParagraph: string;
  AnswerPage: string;
  CreatedBy: Account;
  RocketID: RocketID;
  LastUpdateHeight: number;
  LastUpdateHash: string;
  LastUpdateUnix: number;
  Events: string[];
  constructor() {
    this.Events = []
    this.Question = ""
  }
}
