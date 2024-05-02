import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductOptionsUpdateServiceProps = {
  customerId: number;
  parentId: string;
  productId: string;
  title: string;
};

export async function CustomerProductOptionsUpdateService(
  props: CustomerProductOptionsUpdateServiceProps
) {
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_UPDATE, {
    variables: {
      productId: `gid://shopify/Product/${props.productId}`,
      variants: [{ id: "gid://shopify/ProductVariant/123456789", price: 100 }],
    },
  });

  return data?.productVariantsBulkUpdate?.product;
}

export const PRODUCT_OPTION_UPDATE = `#graphql
  mutation productOptionUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!] = {}) {
  productVariantsBulkUpdate(
    productId: $productId,
    variants: $variants
  ) {
    product {
      id
      variants(first: 5) {
        nodes {
          id
          price
          metafield(key: "duration", namespace: "booking") {
            id
            type
            value
          }
        }
      }
    }
  }
}
` as const;
