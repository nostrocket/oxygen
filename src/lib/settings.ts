export const ignitionPubkey =
  "546b4d7f86fe2c1fcc7eb10bf96c2eaef1daa26c67dad348ff0e9c853ffe8882";

  export var mainnetRoot = "1bf16cac62588cfd7e3c336b8548fa49a09627f03dbf06c7a4fee27bc01972c8"
  export var nostrocketIgnitionEvent = ""

  export const simulate = true

  const testnet = false

  const testnetRoot = "b43986227b5e84aee127501749886e34b15f232fc381c5048023a1047086b121"
  const testnetNostrocketIgnition = "8826f5750cf13faa5ba3e516fd2791a0097b012728c1a0eabe50c6503859e546"

  if (testnet) {
    mainnetRoot = testnetRoot
    nostrocketIgnitionEvent = testnetNostrocketIgnition
  }

  export const rootTag = ["e", mainnetRoot, "", "root"]
  export const nostrocketIgnitionTag = ["e", nostrocketIgnitionEvent, "", "rocket"]


export const rocketNameValidator = /^\w{5,20}$/

export const hexPubkeyValidator = /^\w{64}$/