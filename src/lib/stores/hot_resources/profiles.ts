import type { Account } from "$lib/stores/nostrocket_state/types";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

export const profiles = writable<Map<Account, NDKUser>>(new Map());
