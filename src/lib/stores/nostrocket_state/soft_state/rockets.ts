import { derived } from "svelte/store";
import { consensusTipState } from "../master_state";

export const Rockets = derived(consensusTipState, ($nr) => {
    return $nr.RocketMap;
  });