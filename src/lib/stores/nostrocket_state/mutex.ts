import { Mutex } from "async-mutex";
import { writable } from "svelte/store";

const CHANGE_STATE_MUTEX = new Mutex();
export const MutexObserver = writable(false);

export async function changeStateMutex(id: string | undefined) {
  let p = new Promise<() => void>((resolve) => {
    CHANGE_STATE_MUTEX.acquire().then(() => {
      MutexObserver.set(true);
      resolve(() => {
        CHANGE_STATE_MUTEX.release();
        MutexObserver.set(false);
      });
    });
  });
  return p;
}

MutexObserver.subscribe((state) => {
  console.log("Mutext is locked? ", state);
});
