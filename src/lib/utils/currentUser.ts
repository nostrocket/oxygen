import type User from "$lib/classes/user";

export const currentUser = writable<User | undefined>(undefined);
