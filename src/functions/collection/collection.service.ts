import { ProductServiceGetById } from "../product";
import { CollectionModel } from "./collection.model";
import { Collection } from "./collection.types";

export const CollectionServiceAddProduct = async (
  collectionId: number,
  productId: number
) => {
  return CollectionModel.updateOne(
    { collectionId: collectionId },
    {
      $push: {
        productIds: productId,
      },
    }
  );
};

export const CollectionServiceRemoveProduct = async (
  collectionId: number,
  productId: number
) => {
  return CollectionModel.updateOne(
    { collectionId: collectionId },
    {
      $pull: {
        productIds: productId,
      },
    }
  );
};

export interface CollectionServiceGetAllCollection extends Collection {
  products: Array<Awaited<ReturnType<typeof ProductServiceGetById>>>;
}

export const CollectionServiceGetAll = async () => {
  const collections = await CollectionModel.find().lean();
  const aggregateCollections = [];

  for (const collection of collections) {
    const products = [];
    for (const productId of collection.productIds) {
      const product = await ProductServiceGetById({ productId });
      if (product) {
        products.push(product);
      }
    }
    aggregateCollections.push({
      products,
      ...collection,
    });
  }

  return aggregateCollections;
};
