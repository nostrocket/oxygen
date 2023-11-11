import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
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
    // if (!this.IdentityMap.get(ignitionPubkey)) {
    //   this.IdentityMap.set(
    //     ignitionPubkey,
    //     new Identity({
    //       Account: ignitionPubkey,
    //       Name: "Ignition Account",
    //       MaintainerBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
    //       Order: 0,
    //       UniqueSovereignBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
    //     })
    //   );
    // }
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
    this.ConsensusEvents.forEach((e) => {
      if (!copy.ConsensusEvents.includes(e)) {
        copy.ConsensusEvents.push(e);
      }
    });
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
  Event: NostrEvent;
  Participants: Map<Account, Account[]>;
  constructor() {
    this.Maintainers = new Map<Account, Account[]>();
    this.Participants = new Map<Account, Account[]>();
  }
  updateParticipants(input: NDKEvent): boolean {
    if (input.kind == 31009) {
      if (this.isParticipant(input.pubkey)) {
        let list: Array<Account> = [];
        input.getMatchingTags("p").forEach((pk) => {
          if (pk[1]) {
            if (pk[1].length == 64 && !this.isParticipant(pk[1])) {
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
    if (this.CreatedBy == pubkey) {
      valid = true;
    }
    if (this.Participants.has(pubkey)) {
      valid = true;
    }
    if (!valid) {
      this.Participants.forEach((x) => {
        x.forEach((y) => {
          if (y == pubkey) {
            valid = true;
          }
        });
      });
    }
    return valid;
  }

  isMaintainer(pubkey: string):boolean {
    if (pubkey == ignitionPubkey) {
      return true
    }
    //todo implmenent maintainer tree
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
  ClaimedAt: bigint;
  ClaimedBy: Account;
  CreatedBy: Account;
  Rocket: RocketID;
  Status: string;
  LastUpdateHeight: number;
  LastUpdateHash: string;
  LastUpdateUnix: number;
  Children: Set<string>;
  Events: NostrEvent[];
  constructor() {
    this.Parents = new Set<string>();
    this.Children = new Set<string>();
    this.Events = [];
    this.Status = "open"
  }
  Copy():Problem {
    let copy = new Problem()
    this.Parents.forEach(p=>{
      copy.Parents.add(p)
    })
    this.Children.forEach(p=>{
      copy.Children.add(p)
    })
    this.Events.forEach(e=>{
      copy.Events.push(e)
    })
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
export type RocketID = EventID; //rocketID in hex
export type Sha256 = string;
