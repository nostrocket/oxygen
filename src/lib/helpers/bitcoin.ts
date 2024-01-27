import { get, writable } from "svelte/store";
import { unixTimeNow } from "./mundane";

var latestBitcoinHeight = 0;
var latestBitcoinHash = "";
var lastCheckTime = 0;

function synchronousRequest(url: string): string {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send(null);
  if (xhr.status === 200) {
    return xhr.responseText;
  } else {
    throw new Error("Request failed: " + xhr.statusText);
  }
}

let _b:BitcoinTip = {hash: "", height: 0}
export let bitcoinTip = writable(_b)



export function BitcoinHeightTag(): string[] {
  let tip = get(bitcoinTip)
  let bths: string[] = ["bitcoin", ""];
  if (tip.hash && tip.height) {
    bths = ["bitcoin", tip.height.toString() + ":" + tip.hash];
  }
  return bths;
}

export async function getBitcoinTip() {
  const response = await fetch("https://blockstream.info/api/blocks/tip")
  const _json = await response.json()
  if (_json[0]) {
    let r: BitcoinTip = {
      height: _json[0].height,
      hash: _json[0].id,
    };
    bitcoinTip.set(r)
    return r;
  }
  return null
}

// export function BitcoinTipHeight(): BitcoinTip {
//   let bitcoinHeight = latestBitcoinHeight;
//   let bitcoinHash = latestBitcoinHash;
//   if (unixTimeNow() > lastCheckTime + 60) {
//     try {
//       let response = synchronousRequest(
//         "https://blockstream.info/api/blocks/tip"
//       );
//       let responseJSON = JSON.parse(response);
//       bitcoinHeight = responseJSON[0].height;
//       latestBitcoinHeight = bitcoinHeight;
//       bitcoinHash = responseJSON[0].id;
//       latestBitcoinHash = bitcoinHash;
//       lastCheckTime = unixTimeNow();
//     } catch (err) {
//       console.log(err);
//     }
//   }
//   let r: BitcoinTip = {
//     height: bitcoinHeight,
//     hash: bitcoinHash,
//   };
//   return r;
// }

type BitcoinTip = {
  height: number;
  hash: string;
};
