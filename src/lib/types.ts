import type NDKEvent from "@nostr-dev-kit/ndk";
import type NDKTag from "@nostr-dev-kit/ndk";

export interface Nostrocket {
    Accounts: Account[];
    IdentityList: Identity[];
    IdentityMap: { [key: Account]: Identity };
    Replay: { [key: Account]: EventID };
    Rockets: Rocket[];
    RocketMap:  { [key: RocketID]: Rocket };
    Problems: { [key: ProblemID]: Problem };
    //Parse(input: string) :Nostrocket
}

export default class State implements Nostrocket {
    Accounts: Account[];
    IdentityList: Identity[];
    IdentityMap: { [p: Account]: Identity };
    Problems: { [p: ProblemID]: Problem };
    Replay: { [p: Account]: EventID };
    RocketMap: { [p: RocketID]: Rocket };
    Rockets: Rocket[];
    constructor(input: string) {
        this.IdentityList = []
        this.IdentityMap = {}
        this.Accounts = []
        this.RocketMap = {}
        this.Rockets = []
        let l: any
        try {
            let j = JSON.parse(input)
            Object.keys(j.identity).forEach((i) => {
                //console.log(j.identity[i])
                let id = new identity(j.identity[i])
                this.IdentityMap[id.Account] = id
                this.IdentityList.push(id)
                //console.log(id)
            })
            this.IdentityList.sort((a, b) => b.Order - a.Order)
            for (let key in this.IdentityMap) {
                this.Accounts.push(key)
            }
            Object.keys(j.rockets).forEach(i => {
                let r = new rocket(j.rockets[i])
                this.RocketMap[r.UID] = r
                this.Rockets.push(r)
                //console.log(j.rockets[i].RocketName)
            })
            console.log(j)
        }
        catch {
            console.log("failed to parse State constructor")
        }
        
    }
    
}

class rocket implements Rocket {
    UID: string;
    Name: string;
    CreatedBy: string;
    ProblemID: string;
    MissionID: string;
    Maintainers: string[];
    Merits: { [key: string]: Merit; };
    constructor(input: any) {
        this.UID = input.RocketUID
        this.Name = input.RocketName
        this.CreatedBy = input.CreatedBy
        this.ProblemID = input.ProblemID
        this.MissionID = input.MissionID
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
        this.Account = input.Account
        this.Name = input.Name
        this.MaintainerBy = input.MaintainerBy
        this.Order = input.Order
        this.UniqueSovereignBy = input.UniqueSovereignBy
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