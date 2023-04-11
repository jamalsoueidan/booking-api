import {
  ProductServiceGetByProductId,
  ProductServiceGetByProductIdReturn,
} from "../product";
import { CollectionModel } from "./collection.model";
import { CollectionServiceGetAllReturn } from "./collection.types";

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

export const CollectionServiceGetAll = async () => {
  const collections = await CollectionModel.find().lean();
  const products: ProductServiceGetByProductIdReturn[] = [];
  const aggregateCollections: CollectionServiceGetAllReturn[] = [];

  for (const collection of collections) {
    for (const productId of collection.productIds) {
      const product = await ProductServiceGetByProductId(productId);
      products.push(product);
    }
    aggregateCollections.push({
      products,
      ...collection,
    });
  }

  return aggregateCollections;
};
