import { status } from "$lib/state";
import { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
// import { fetchJson } from 'fetch-json';
import ndkStore from "$lib/ndk";
import { get } from "svelte/store";
// import type { NestedProblem, ProblemInfo } from '$lib/classes/problem';

export function unixTimeNow() {
  return Math.floor(new Date().getTime() / 1000);
}

export function dateTomorrow() {
  return new Date(Date.now() + 3600 * 1000 * 24);
}

export function truncatedBech(bech32: string, length?: number): string {
  return `${bech32.substring(0, length || 9)}...`;
}

export async function copyToClipboard(textToCopy: string) {
  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
}

export function getIdentityByAccount(account: string) {
  if (status.identity) {
    const identities = new Map(Object.entries(status.identity));
    return identities.get(account)?.Name;
  } else return null;
}

export async function PayForProduct(
  lud06,
  pubkey,
  amount,
  callback,
  productID
) {
  return new Promise((resolve) => {
    //get the LUD06 from the payments object
    const ndk = get(ndkStore);
    let zapRequest = new NDKEvent(ndk);
    zapRequest.kind = 9734;
    zapRequest.content = "I'm paying for a Nostrocket product";
    zapRequest.tags = [
      ["relays", "wss://nostr.mutinywallet.com"],
      ["amount", (amount * 1000).toString()],
      ["lnurl", lud06],
      ["p", pubkey],
      ["e", productID],
    ];
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    zapRequest.sign(ndk.signer).then(() => {
      fetchJson
        .get(
          `${callback}?amount=${amount * 1000}&nostr=${JSON.stringify(
            zapRequest.rawEvent()
          )}`
        )
        .then((x) => {
          resolve(x);
        });
    });
  });
}

function findEventInNestedProblem(
  eventId: string,
  threadedEvents: NestedProblem
): NestedProblem | undefined {
  if (eventId === threadedEvents.problem.UID) {
    return threadedEvents;
  }
  for (const reply of threadedEvents.subProblems) {
    if (reply.problem.UID === eventId) {
      return reply;
    } else {
      if (reply.subProblems.length > 0) {
        const ev = findEventInNestedProblem(eventId, reply);
        return ev;
      }
    }
  }
  return undefined;
}

function addNode(
  e: ProblemInfo,
  threadedEvents: NestedProblem
): NestedProblem | null {
  const parentId = e.Parent;
  const parent = findEventInNestedProblem(parentId, threadedEvents);
  if (parent !== undefined) {
    parent.subProblems.push({ problem: e, subProblems: [] });
  } else {
    // console.log(e.Title,'parent not found')
    return null;
  }

  return threadedEvents;
}
export function getNestedProblems(
  problems: ProblemInfo[],
  nestedProblems: NestedProblem[],
  iteration = 0
) {
  console.log(iteration, "er", problems.length);

  if (iteration > 50) {
    return nestedProblems as NestedProblem[];
  }
  if (problems.length == 0) {
    return nestedProblems as NestedProblem[];
  }
  const allProblemIds = problems.map((item) => item.UID);

  if (nestedProblems.length === 0) {
    // nestedProblems = [];
    problems.forEach((e, idx) => {
      if (!allProblemIds.includes(e.Parent)) {
        console.log(idx, "??????????????????????????????????????????????????");
        const problem = problems.splice(idx, 1)[0];
        nestedProblems?.push({
          problem: problem,
          subProblems: [],
        } as NestedProblem);
      }
    });
  } else {
    problems.forEach((e, idx) => {
      for (const nestProblem of nestedProblems) {
        const err = addNode(e, nestProblem);
        if (err !== null) {
          const problem = problems.splice(idx, 1)[0];
          continue;
        }
      }
    });
  }

  // If there are still items, do it again
  if (problems.length > 0) {
    return getNestedProblems(problems, nestedProblems, iteration + 1);
  }

  return nestedProblems;
}
