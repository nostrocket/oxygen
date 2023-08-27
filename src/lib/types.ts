import NDKEvent from "@nostr-dev-kit/ndk";
import NDKTag from "@nostr-dev-kit/ndk";
import { writable } from 'svelte/store';

export interface Nostrocket {
    Accounts: Account[];
    Identity: { [key: Account]: Identity };
    Replay: { [key: Account]: EventID };
    Rockets:  { [key: RocketID]: Rocket };
    Problems: { [key: ProblemID]: Problem };
    //Parse(input: string) :Nostrocket
}

export default class State implements Nostrocket {
    Accounts: Account[];
    Identity: { [p: Account]: Identity };
    Problems: { [p: ProblemID]: Problem };
    Replay: { [p: Account]: EventID };
    Rockets: { [p: RocketID]: Rocket };
    constructor(input: string) {
        this.Identity = {}
        this.Accounts = []
        let j = JSON.parse(input)
        Object.keys(j.identity).forEach((i) => {
            //console.log(j.identity[i])
            let id = new identity(j.identity[i])
            this.Identity[id.Account] = id
            //console.log(id)
        })
        for (let key in this.Identity) {
            // let value = this.Identity[key];
            this.Accounts.push(key)
            // console.log(key + ":" + value.Name)
        }
    }
}

export const CurrentState = writable<Nostrocket>(State)

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
        this.Account = input.Account
        this.Name = input.Name
        this.MaintainerBy = input.MaintainerBy
        this.Order = input.Order
        this.UniqueSovereignBy = input.UniqueSovereignBy
        return undefined;
    }

}

export interface Problem {
    UID:       ProblemID;
    Parent:    ProblemID;
    Title:     string;
    Body:      string;
    Closed:    boolean;
    ClaimedAt: bigint;
    ClaimedBy: Account;
    CreatedBy: Account;
    Rocket:    RocketID;
    Tags:      Array<NDKTag>;
}

export interface Identity {
    Account:               Account;
    Name:                  string;
    UniqueSovereignBy:     string;
    CharacterVouchedForBy: Array<string>;
    MaintainerBy:          string;
    Pubkeys:               Array<string>;
    OpReturnAddr:          Array<string>;
    Order:                 number;
    PermanymEventID:       string;
    LatestKind0:           NDKEvent;
    //Parse(input: any): Identity
}

export interface Rocket {
    UID: RocketID,
    Name: string,
    CreatedBy: Account,
    ProblemID: EventID,
    MissionID: EventID,
    Maintainers: Array<Account>
    Merits: { [key: Account]: Merit }
}

export interface Merit {
    Requests: { [key: EventID]: MeritRequest }
}

export interface MeritRequest {
    UID: EventID,
    LtLocked: boolean,
    OwnedBy: Account,
    CreatedBy: Account,
    Problem: ProblemID,
    CommitMsg: string,
    SolutionMsg: string,
    PatchHash: Sha256,
    Amount: bigint,
    RemuneratedAmount: bigint,
    DividendAmount: bigint,
    WitnessedAt: bigint,
    Nth: bigint,
    Ratifiers: { [key: Account]: bigint},
    RatifyPermille: bigint,
    Blackballers: { [key: Account]: bigint},
    BlackballPermille: bigint,
    Approved: boolean,
    Rejected: boolean,
    MeritsCreated: bigint,
}

export type Account = Sha256; //pubkey in hex
export type EventID = Sha256;
export type ProblemID = EventID
export type RocketID = EventID; //rocketID in hex
export type Sha256 = string