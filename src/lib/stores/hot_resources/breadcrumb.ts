import { base } from "$app/paths";
import { writable } from "svelte/store";

export class Crumb {
    Name:string;
    Path:string;
    constructor(name:string, path:string) {
        this.Name = name;
        this.Path = path
    }
}

let c:Crumb[] = [new Crumb("Home", `${base}/`)]
export const BreadCrumb = writable(c)