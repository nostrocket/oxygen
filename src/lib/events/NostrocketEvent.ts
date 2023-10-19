import createEventpool from "$lib/stores/mempool";
import NDK, { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";

const memPool = createEventpool()
const eventsInState = createEventpool()

export default class NostrocketEvent extends NDKEvent {
    constructor(ndk: NDK, event: NostrEvent) {
        super(ndk, event);
    }

    static from(event: NDKEvent): NostrocketEvent {
        // const rawEvent = event.rawEvent()
        //
        // if (!eventsInState.fetch(rawEvent.id!) && !memPool.fetch(rawEvent.id!)) {
        //     memPool.push(event);
        // }

        if (event.kind === 30000) {
            console.log(event.pubkey)
        }

        return new NostrocketEvent(event.ndk!, event.rawEvent());
    }
}