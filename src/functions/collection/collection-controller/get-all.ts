import { _, onlyOwner } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { CollectionServiceGetAll } from "../collection.service";

export type CollectionControllerGetAllRequest = {};

export type CollectionControllerGetAllResponse = Awaited<
  ReturnType<typeof CollectionServiceGetAll>
>;

export const CollectionControllerGetAll = _(jwtVerify, onlyOwner, () => {
  return CollectionServiceGetAll();
});
