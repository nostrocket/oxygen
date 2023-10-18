import type {Account, Nostrocket} from "$lib/types";

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


/**
 *
 * @param rocket
 * @param rootAccount
 * @param state
 * @param orderedList
 */
export function recursiveList(
    rocket: string,
    rootAccount: Account,
    state: Nostrocket,
    orderedList: Account[]
) {
  if (!orderedList.includes(rootAccount)) {
    orderedList.push(rootAccount);
  }
  state.RocketMap.get(rocket)
      ?.Participants.get(rootAccount)
      ?.forEach((pk) => {
        recursiveList(rocket, pk, state, orderedList);
      });
  return orderedList;
}