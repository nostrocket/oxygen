import { unixTimeNow } from "./mundane";

var latestBitcoinHeight = 0;
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

export function BitcoinTipHeight(): number {
  let bitcoinHeight = latestBitcoinHeight;
  if (unixTimeNow() > lastCheckTime + 60) {
    try {
      let height = synchronousRequest(
        "https://blockstream.info/api/blocks/tip/height"
      );
      bitcoinHeight = Number(height);
      latestBitcoinHeight = bitcoinHeight;
      lastCheckTime = unixTimeNow();
    } catch (err) {
      console.log(err);
    }
  }

  return bitcoinHeight;
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
