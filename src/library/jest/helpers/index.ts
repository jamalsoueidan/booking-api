export * from "./user";

// One such common pitfall is related to the ObjectId class of MongoDB.
// If _id in both objects are instances of ObjectId, they won't be considered
// equal even if their string representations are the same, because they're different objects.

export function omitObjectIdProps(obj: any) {
  const { _id, scheduleId, ...rest } = obj;
  return rest;
}
