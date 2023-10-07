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

export function BitcoinTipHeight(): BitcoinTip {
  let bitcoinHeight = latestBitcoinHeight;
  let bitcoinHash = latestBitcoinHash;
  if (unixTimeNow() > lastCheckTime + 60) {
    try {
      let response = synchronousRequest(
        "https://blockstream.info/api/blocks/tip"
      );
      let responseJSON = JSON.parse(response)
      console.log(responseJSON[0].id)
      bitcoinHeight = responseJSON[0].height
      latestBitcoinHeight = bitcoinHeight;
      bitcoinHash = responseJSON[0].id;
      latestBitcoinHash = bitcoinHash
      lastCheckTime = unixTimeNow();
    } catch (err) {
      console.log(err);
    }
  }
  let r: BitcoinTip = {
    height: bitcoinHeight,
    hash: bitcoinHash
  }
  return r
}

type BitcoinTip = {
  height: number
  hash: string
}

// export function bitcoinTip():BitcoinTip {
//     let btcTip: BitcoinTip;
//     btcTip.median = 0
//     return btcTip
// }

// type BitcoinTip = {
// height: number
// hash: string
// median: number
// miner: number
// }
