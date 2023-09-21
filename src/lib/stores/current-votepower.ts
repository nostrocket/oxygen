import { get, writable } from "svelte/store";
import { currentUser } from "./current-user";
import { ignitionPubkey } from "$lib/settings";

export const userVotepower = writable<number>(0);
export const onlineVotepower = writable<votepowerForUser[]>([]);
export const weHaveTheLead = writable(false)

//todo use ephemeral events to see who's online, add and remove pubkeys from set

currentUser.subscribe((user)=>{
    if (user) {
        if (user.hexpubkey() == ignitionPubkey) {
            userVotepower.set(1)
            //todo get current votepower from state
            let temporaryDevVotepower: votepowerForUser = {
                pubkey: user.hexpubkey(),
                votepower: 1
            }

            onlineVotepower.update((c) => {
                if (!c) {
                    c = []
                } else {
                    let success = false;
                    c?.forEach((v, i) => {
                        if (v.pubkey == user.hexpubkey()) {
                            c[i].votepower = 1
                            success = true
                        }
                    })
                    if (!success) {
                        c.push(temporaryDevVotepower)
                    }
                }
                return c
            })

        }
    }
})

onlineVotepower.subscribe((ovp) => {
    let biggest = 0 
    ovp?.forEach((vp)=>{
        if (vp.votepower > biggest && vp.pubkey !== get(currentUser)?.hexpubkey()) {
            biggest = vp.votepower
        }
    })
    if (get(userVotepower) > biggest) {
        weHaveTheLead.set(true)
    }
})

type votepowerForUser = {
    pubkey: string
    votepower: number
}



