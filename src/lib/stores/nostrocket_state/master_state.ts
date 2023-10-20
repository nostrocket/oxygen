//Build the current Hard state from Consensus Notes (follow a consensus chain and handle each embedded hard state change request)

import { writable } from "svelte/store";
import { Nostrocket } from "./types";

//Build the current Soft state from Soft State Change Requests (handle these directly from relays)

let r: Nostrocket = new Nostrocket(JSON.stringify(""));

export const consensusTipState = writable(r);