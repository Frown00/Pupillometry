/* eslint-disable import/prefer-default-export */
export function removeElement<T, K extends keyof T>(
  arr: T[],
  property: K,
  value: T[K]
) {
  let index = -1;
  for (let i = 0; i < arr.length; i += 1) {
    const el = arr[i];
    if (el[property] === value) {
      index = i;
      break;
    }
  }
  if (index === -1) return null;
  return arr.splice(index, 1)[0];
}
