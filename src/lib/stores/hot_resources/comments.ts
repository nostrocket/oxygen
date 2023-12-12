import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

export let comments = writable(new Map<string, NDKEvent>());