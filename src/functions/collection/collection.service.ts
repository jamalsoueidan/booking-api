import {
  ProductServiceGetAllProduct,
  ProductServiceGetById,
  ProductServiceGetByIdReturn,
} from "../product";
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

export type CollectionServiceGetAllProps = {
  group?: string;
};
export interface CollectionServiceGetAllCollection extends Collection {
  products: ProductServiceGetAllProduct[];
}

export type CollectionServiceGetAllReturn = CollectionServiceGetAllCollection[];

export const CollectionServiceGetAll = async ({
  group,
}: CollectionServiceGetAllProps = {}) => {
  const collections = await CollectionModel.find().lean();
  const aggregateCollections: CollectionServiceGetAllReturn = [];

  for (const collection of collections) {
    const products: ProductServiceGetByIdReturn[] = [];
    for (const productId of collection.productIds) {
      const product = await ProductServiceGetById({ productId, group });
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
