export const MAX_STATECHANGE_EVENT_AGE = 86_400; //seconds

export let ignitionPubkey =
  "d91191e30e00444b942c0e82cad470b32af171764c2275bee0bd99377efd4075";

export var rootEventID =
  "1bf16cac62588cfd7e3c336b8548fa49a09627f03dbf06c7a4fee27bc01972c8";

export var nostrocketIgnitionEvent =
  "863d2d89a4245f0979fd95c1041912242628823b9cfab971a45954498e5123fe";

export const simulateEvents = false; //will not publish events if set to True.

export const testnet = false;

const testnetRoot =
  "b43986227b5e84aee127501749886e34b15f232fc381c5048023a1047086b121";

const testnetNostrocketIgnition =
  "4deef348e8c69b171bd1003d6ca88a9ef327b1c0535de60632c08f06045545a4";

export const rootProblem =
  "d0afd68b5cafa58382edb38b7ac7feef229a916f22330922e4be6cd22193b1a5";

if (testnet) {
  //ignitionPubkey = "546b4d7f86fe2c1fcc7eb10bf96c2eaef1daa26c67dad348ff0e9c853ffe8882";
  rootEventID = testnetRoot;
  nostrocketIgnitionEvent = testnetNostrocketIgnition;
}

export const rootTag = ["e", rootEventID, "", "root"];
export const nostrocketIgnitionTag = [
  "e",
  nostrocketIgnitionEvent,
  "",
  "rocket",
];

export const rocketNameValidator = /^\w{4,20}$/;

export const hexPubkeyValidator = /^\w{64}$/;

export const profileRelays = [
  //"wss://nostr.688.org",
  "wss://search.nos.today",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.bg",
  "wss://relay.snort.social",
  "wss://offchain.pub",
  "wss://relay.primal.net",
  "wss://relay.nostr.band",
  "wss://pyramid.fiatjaf.com",
];

export const defaultRelays = [
  "wss://relay.nostrocket.org",
  // "ws://45.77.143.197:7777",
  //"ws://127.0.0.1:6969",
  //"wss://nostr.688.org"
  // "wss://relay.damus.io",
  // "wss://nos.lol",
  // "wss://relay.nostr.bg",
  // "wss://relay.snort.social",
  // "wss://offchain.pub",
  // "wss://relay.primal.net",
];

export const localRelays = [
  "wss://relay.mutinywallet.com",
  //"wss://relay.nostrocket.org",
  //"ws://45.77.143.197:7777",
  "ws://127.0.0.1:6969",
  //"wss://nostr.688.org"
];

export const ignoreConsensusEvent =
  "f61353291a91f61c289aefe479b1314f024ba188df33a94bb66027431a777fbc";

export const NewRocketProblem =
  "cc5bcc23caa8bfda2ef7920c1ea9600282bcdba81456b13d1611d84967aa473b";

export const relayHint = "relay.nostrocket.org";

export const ZAPS_ENABLED = true;