import { CollectionModel } from "~/functions/collection";
import { ShopifyHelperGetId } from "../shopify-helper";
import { ShopifyCollection } from "./get-collections";

export type CollectionServiceCreateCollectionsProps = ShopifyCollection[];

export const ShopifyServiceInsertCollections = async (
  collections: CollectionServiceCreateCollectionsProps
) => {
  const collectionBulkWrite = collections?.map((c) => ({
    updateOne: {
      filter: { collectionId: ShopifyHelperGetId(c.id) },
      update: {
        $set: {
          collectionId: ShopifyHelperGetId(c.id),
          title: c.title,
          image: c.image?.url,
        },
      },
      upsert: true,
    },
  }));

  return CollectionModel.bulkWrite(collectionBulkWrite);
};
