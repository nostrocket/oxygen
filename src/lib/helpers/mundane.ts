import type { NDKEvent } from "@nostr-dev-kit/ndk";
import * as showdown from "showdown";

export function unixTimeNow() {
  return Math.floor(new Date().getTime() / 1000);
}

/**
 * @function
 * @description Deep clone a class instance.
 * @param {object} instance The class instance you want to clone.
 * @returns {object} A new cloned instance.
 */
export function clone(instance: any) {
  return Object.assign(
    Object.create(
      // Set the prototype of the new object to the prototype of the instance.
      // Used to allow new object behave like class instance.
      Object.getPrototypeOf(instance)
    ),
    // Prevent shallow copies of nested structures like arrays, etc
    JSON.parse(JSON.stringify(instance))
  );
}

export function fetchNoteFromSet(
  s: Set<NDKEvent>,
  id: string
): NDKEvent | undefined {
  let note: NDKEvent | undefined = undefined;
  s.forEach((e) => {
    if (e.id == id) {
      note = e;
    }
  });
  return note;
}

/**
 * @function
 * @description Convert markdown to HTML
 *
 * @param content Markdown string
 * @return string HTML string
 */
export const makeHtml = (content: string | undefined): string => {
  const converter = new showdown.Converter({
    extensions: [...bindings],
  });
  content = content ?? "";

  return converter.makeHtml(content);
};

const classMap = {
  h1: "title is-1",
  h2: "title is-2",
  h3: "title is-3",
  h4: "title is-4",
  h6: "subtitle",
  ul: "problemUL",
  li: "problemLI",
};

const bindings = Object.keys(classMap).map((key) => ({
  type: "output",
  regex: new RegExp(`<${key}(.*)>`, "g"),
  replace: `<${key} class="${classMap[key]}" $1>`,
}));
