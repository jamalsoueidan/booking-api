import { ShopifyServiceGetCollections } from "./get-collections";
import { ShopifyServiceGetProducts } from "./get-products";

import { ProductModel } from "~/functions/product";
import { ShopifyHelperGetId } from "../shopify-helper";
import { ShopifyProduct } from "./get-products";
import { ShopifyServiceInsertCollections } from "./insert-collections";

export const ShopifyServiceLoadCollections = async () => {
  const collections = await ShopifyServiceGetCollections();

  for (const collection of collections) {
    const products = await ShopifyServiceGetProducts(collection.id);
    const productIds = products.map((p) => ShopifyHelperGetId(p.id));
    collection.productIds = productIds;
    await ShopifyServiceInsertProducts(products);
  }

  return ShopifyServiceInsertCollections(collections);
};

const ShopifyServiceInsertProducts = async (products: ShopifyProduct[]) => {
  const productBulkWrite = products?.map((c) => ({
    updateOne: {
      filter: { productId: ShopifyHelperGetId(c.id) },
      update: {
        $set: {
          productId: ShopifyHelperGetId(c.id),
          title: c.title,
          image: c.featuredImage?.url,
        },
      },
      upsert: true,
    },
  }));

  return ProductModel.bulkWrite(productBulkWrite);
};
