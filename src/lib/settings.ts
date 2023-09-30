export const ignitionPubkey =
  "546b4d7f86fe2c1fcc7eb10bf96c2eaef1daa26c67dad348ff0e9c853ffe8882";

  export var ignitionEvent = "1bf16cac62588cfd7e3c336b8548fa49a09627f03dbf06c7a4fee27bc01972c8"

  export const simulate = true

  const testnet = false

  const testnetIgnitionEvent = "b43986227b5e84aee127501749886e34b15f232fc381c5048023a1047086b121"

  if (testnet) {
    ignitionEvent = testnetIgnitionEvent
  }

  export const ignitionTag = ["e", ignitionEvent, "", "root"]


export const rocketNameValidator = /^\w{5,20}$/