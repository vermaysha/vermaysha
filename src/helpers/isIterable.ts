export function isIterable(obj: any) {
  // checks for null and undefined
  if (obj === null || obj === undefined) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
