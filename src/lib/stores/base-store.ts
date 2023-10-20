import {type Writable, writable} from 'svelte/store';

export default class BaseStore {
    protected static instance: BaseStore;
    protected data: Writable<{}>;

    protected constructor(input: {}) {
        this.data = writable(input);  // Initialize Svelte store
    }

    static getInstance(input): BaseStore {
        if (!BaseStore.instance) {
            BaseStore.instance = new BaseStore(input);
        }
        return BaseStore.instance;
    }

    get store() {
        return this.data;
    }
}
