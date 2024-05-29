import { shopifyAdmin } from "~/library/shopify";

export const destroyProductName = "destroyProductName";
export const destroyProduct = async ({ productId }: { productId: number }) => {
  const { data } = await shopifyAdmin().request(PRODUCT_DESTROY, {
    variables: {
      productId: `gid://shopify/Product/${productId}`,
    },
  });

  return data?.productDelete?.deletedProductId;
};

export const PRODUCT_DESTROY = `#graphql
  mutation productDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;
