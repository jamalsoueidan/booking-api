import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { PRODUCT_OPTION_FRAGMENT } from "~/functions/customer/services/product-options/add";
import { CustomerProductServiceGet } from "~/functions/customer/services/product/get";
import { shopifyAdmin } from "~/library/shopify";

export const updateProductOptionName = "updateProductOption";
export const updateProductOption = async ({
  productOptionId,
  customerId,
  productId,
}: {
  productOptionId: number;
  customerId: number;
  productId: number;
}) => {
  const rootProduct = await CustomerProductServiceGet({
    customerId,
    productId,
  });

  const productOption = rootProduct.options?.find(
    (p) => p.productId === productOptionId
  );

  if (!productOption) {
    throw new Error(`Failed to find product option ${productOptionId}`);
  }

  const user = await CustomerServiceGet({
    customerId,
  });

  const { data } = await shopifyAdmin().request(PRODUCT_OPTION_ADD, {
    variables: {
      id: `gid://shopify/Product/${productOption.productId}`,
      metafields: [
        {
          id: productOption.parentIdMetafieldId,
          value: `gid://shopify/Product/${productId}`,
        },
      ],
      tags: [
        `user`,
        `user-${user.username}`,
        `userid-${customerId}`,
        `options`,
        `parentid-${rootProduct.productId}`,
        `parent-${rootProduct.productHandle}`,
      ].join(", "),
    },
  });

  if (!data?.productUpdate?.product) {
    throw new Error(
      `Failed to update product option ${productOption.productId}`
    );
  }

  return data.productUpdate.product;
};

export const PRODUCT_OPTION_ADD = `#graphql
  ${PRODUCT_OPTION_FRAGMENT}
  mutation ProductOptionAdd($id: ID!, $metafields: [MetafieldInput!]!, $tags: [String!]!) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags}) {
      product {
        ...ProductOptionFragment
      }
    }
  }
` as const;
