import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  CollectionServiceGetAll,
  CollectionServiceGetAllProps,
  CollectionServiceGetAllReturn,
} from "../collection.service";

export type CollectionControllerGetAllRequest = {
  query: CollectionServiceGetAllProps;
};

export type CollectionControllerGetAllResponse = CollectionServiceGetAllReturn;

export const CollectionControllerGetAll = _(
  jwtVerify,
  ({ query, session }: SessionKey<CollectionControllerGetAllRequest>) => {
    if (!session.isOwner) {
      query.group = session.group;
    }

    return CollectionServiceGetAll(query);
  }
);
