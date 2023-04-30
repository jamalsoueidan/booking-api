import { SessionKey, _ } from "~/library/handler";
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
  ({ query, session }: SessionKey<CollectionControllerGetAllRequest>) => {
    if (!session.isOwner) {
      query.group = session.group;
    }

    return CollectionServiceGetAll(query);
  }
);
