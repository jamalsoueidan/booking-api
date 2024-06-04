import { CustomerProductServiceGet } from "~/functions/customer/services/product/get";
import { LocationTypes } from "~/functions/location";
import { shopifyAdmin } from "~/library/shopify";

export const updatePriceName = "updatePrice";
export const updatePrice = async ({
  customerId,
  productId,
}: {
  customerId: number;
  productId: number;
}) => {
  const { variantId, price, compareAtPrice, locations } =
    await CustomerProductServiceGet({
      customerId,
      productId,
    });

  const isDestination = locations.some(
    (l) => l.locationType === LocationTypes.DESTINATION
  );

  const { data } = await shopifyAdmin().request(PRODUCT_PRICE_UPDATE, {
    variables: {
      id: `gid://shopify/Product/${productId}`,
      variants: [
        {
          id: `gid://shopify/ProductVariant/${variantId}`,
          price: price.amount,
          compareAtPrice: compareAtPrice.amount,
          ...(isDestination
            ? {
                inventoryItem: {
                  requiresShipping: false,
                },
              }
            : {}),
        },
      ],
    },
  });

  if (!data?.productVariantsBulkUpdate?.product) {
    throw new Error(`Failed to update product produce ${productId}`);
  }

  return data.productVariantsBulkUpdate.product;
};

export const PRODUCT_PRICE_UPDATE = `#graphql
  mutation productPricepdate($id: ID!, $variants: [ProductVariantsBulkInput!] = {}) {
    productVariantsBulkUpdate(
      productId: $id,
      variants: $variants
    ) {
      product {
        id
        variants(first: 1) {
          nodes {
            id
            compareAtPrice
            price
          }
        }
      }
    }
  }
` as const;
