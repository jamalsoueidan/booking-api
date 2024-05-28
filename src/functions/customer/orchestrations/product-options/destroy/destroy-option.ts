import { shopifyAdmin } from "~/library/shopify";

export const destroyProductOptionName = "destroyProductOptionName";
export const destroyProductOption = async ({
  productOptionId,
}: {
  productOptionId: number;
}) => {
  const { data } = await shopifyAdmin().request(PRODUCT_OPTION_DESTROY, {
    variables: {
      productId: `gid://shopify/Product/${productOptionId}`,
    },
  });

  return data?.productDelete?.deletedProductId;
};

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;
