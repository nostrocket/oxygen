import { ignitionPubkey } from "../../settings";
import { currentUser } from "../stores/hot_resources/current-user";
import { get, writable } from "svelte/store";

export const userVotepower = writable<number>(0);
export const onlineVotepower = writable<votepowerForUser[]>([]);
export const weHaveTheLead = writable(false);

//todo: use ephemeral events to see who's online, add and remove pubkeys from set

currentUser.subscribe((user) => {
  if (user) {
    if (user.pubkey == ignitionPubkey) {
      userVotepower.set(1);
      //todo: get current votepower from state
      let temporaryDevVotepower: votepowerForUser = {
        pubkey: user.pubkey,
        votepower: 1,
      };

      onlineVotepower.update((c) => {
        if (!c) {
          c = [];
        } else {
          let success = false;
          let i = 0
          for (let v of c) {
            if (v.pubkey == user.pubkey) {
              c[i].votepower = 1;
              success = true;
            }
            i++
          }
          if (!success) {
            c.push(temporaryDevVotepower);
          }
        }
        return c;
      });
    }
  }
});

onlineVotepower.subscribe((ovp) => {
  let biggest = 0;
  for (let vp of ovp) {
    if (vp.votepower > biggest && vp.pubkey !== get(currentUser)?.pubkey) {
      biggest = vp.votepower;
    }
  }
  if (get(userVotepower) > biggest) {
    weHaveTheLead.set(true);
  }
});

type votepowerForUser = {
  pubkey: string;
  votepower: number;
};
