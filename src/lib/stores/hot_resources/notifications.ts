import { writable } from "svelte/store"

let _notifications:string[] = []
export const notifications = writable(_notifications)