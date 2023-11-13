import type { NDKEvent } from "@nostr-dev-kit/ndk";
import * as showdown from "showdown";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds, differenceInYears, format
} from "date-fns";

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


/**
 *
 * @param unixTimestamp
 */
export const formatDateTime = (unixTimestamp: number): string => {
  const now = new Date();
  const timestampDate = new Date(unixTimestamp * 1000);

  const diffInSeconds = differenceInSeconds(now, timestampDate);
  const diffInMinutes = differenceInMinutes(now, timestampDate);
  const diffInHours = differenceInHours(now, timestampDate);
  const diffInDays = differenceInDays(now, timestampDate);
  const diffInMonths = differenceInMonths(now, timestampDate);
  const diffInYears = differenceInYears(now, timestampDate);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 3) return `${diffInDays} days ago`;
  if (diffInMonths < 11) return format(timestampDate, "d MMM, h:mm a");
  if (diffInMonths >= 11 || diffInYears >= 1)
    return `${diffInYears} years ago`;

  return "";
};