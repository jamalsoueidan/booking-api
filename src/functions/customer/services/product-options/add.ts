import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceUpdate } from "../product/update";

export type CustomerProductOptionsAddServiceProps = {
  customerId: number;
  parentId: number;
  productId: number;
  title: string;
};

export async function CustomerProductOptionsAddService({
  customerId,
  parentId,
  productId,
  title,
}: CustomerProductOptionsAddServiceProps) {
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DUPLCATE, {
    variables: {
      id: `gid://shopify/Product/${productId}`,
      title,
    },
  });

  await CustomerProductServiceUpdate(
    {
      customerId,
      productId: parentId,
    },
    {
      options: [
        {
          productId: GidFormat.parse(data.productDuplicate.newProduct.id),
          variants: data.productDuplicate.newProduct.variants.nodes.map(
            (variant) => ({
              variantId: GidFormat.parse(variant.id),
              duration: 0,
            })
          ),
        },
      ],
    }
  );

  await shopifyAdmin.request(PRODUCT_OPTION_ADD_TAG, {
    variables: {
      id: `gid://shopify/Product/${productId}`,
      tags: `${customerId}, ${parentId}, user`,
    },
  });

  return data?.productDuplicate?.newProduct;
}

export const PRODUCT_OPTION_DUPLCATE = `#graphql
  mutation productOptionDuplicate($id: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $id) {
      newProduct {
        id
        title
        variants(first: 5) {
          nodes {
            id
            title
          }
        }
      }
    }
  }
` as const;

export const PRODUCT_OPTION_ADD_TAG = `#graphql
  mutation productOptionAddTag($id: ID!, tags: String!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
    }
  }
` as const;
