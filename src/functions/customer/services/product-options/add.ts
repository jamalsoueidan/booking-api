import { ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceUpdate } from "../product/update";

export type CustomerProductOptionsServiceAddProps = {
  customerId: number;
  productId: number; // add option to this productId
  cloneId: number; // which productId to clone from shopify
  title: string;
};

export async function CustomerProductOptionsServiceAdd({
  customerId,
  productId,
  cloneId,
  title,
}: CustomerProductOptionsServiceAddProps) {
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/${cloneId}`,
      title,
    },
  });

  if (!data) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  const newProductId = GidFormat.parse(data.productDuplicate?.newProduct?.id);

  await shopifyAdmin.request(PRODUCT_OPTION_UPDATE_TAG, {
    variables: {
      id: `gid://shopify/Product/${newProductId}`,
      tags: `user, options, customer-${customerId}, product-${productId}`,
    },
  });

  return CustomerProductServiceUpdate(
    {
      customerId,
      productId,
    },
    {
      options: [
        {
          productId: newProductId,
          variants:
            data.productDuplicate?.newProduct?.variants.nodes.map(
              (variant) => ({
                variantId: GidFormat.parse(variant.id),
                duration: {
                  metafieldId: GidFormat.parse(variant.duration?.id),
                  value: parseInt(variant.duration?.value || "0"),
                },
              })
            ) || [],
        },
      ],
    }
  );
}

export const PRODUCT_OPTION_DUPLCATE = `#graphql
  mutation productOptionDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId) {
      newProduct {
        id
        title
        variants(first: 5) {
          nodes {
            id
            title
            duration: metafield(key: "duration", namespace: "booking") {
              id
              value
            }
          }
        }
      }
    }
  }
` as const;

export const PRODUCT_OPTION_UPDATE_TAG = `#graphql
  mutation productOptionUpdateTag($id: ID!, $tags: [String!]!) {
    productUpdate(input: {tags: $tags, id: $id}) {
      product {
        id
        tags
      }
    }
  }
` as const;
