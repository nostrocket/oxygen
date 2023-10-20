import {type Writable} from "svelte/store";
import BaseStore from "$lib/stores/base-store";
import {ignitionPubkey} from "$lib/settings";

interface Identity {
    publicKeys: string[]
}

interface ISoftState {
    identity: Identity
}

class SoftState extends BaseStore {
    // override protected allows us to enforce type
    protected data: Writable<ISoftState>

    protected constructor(input: ISoftState) {
        super(input)
    }
}

const _default: ISoftState = {
    identity: {
        publicKeys: [ignitionPubkey]
    }
}

export default SoftState.getInstance(_default).store
