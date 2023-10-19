import NDK, {NDKEvent, NDKHighlight, type NostrEvent} from "@nostr-dev-kit/ndk";

export default class IdentityResource extends NDKEvent {
    constructor(ndk: NDK, event: NostrEvent) {
        super(ndk, event);
    }

    static from(event: NDKEvent): IdentityResource {
        console.log('Kind: ', event.rawEvent())
        return new IdentityResource(event.ndk!, event.rawEvent());
    }
}