import { shopifyAdmin } from "~/library/shopify";
import { ProductVariantCreateMutation } from "~/types/admin.generated";

export type CustomerProductServiceCreateVariantProps = {
  productId: number;
  price: number;
  compareAtPrice: number;
};

export const CustomerProductServiceCreateVariant = async (
  props: CustomerProductServiceCreateVariantProps
) => {
  const { body } = await shopifyAdmin.query<{
    data: ProductVariantCreateMutation;
  }>({
    data: {
      query: CREATE_VARIANT,
      variables: {
        input: {
          price: props.price,
          compareAtPrice: props.compareAtPrice,
          productId: `gid://shopify/Product/${props.productId}`,
          inventoryItem: {
            tracked: false,
          },
          options: `Artist ${props.price}.${props.compareAtPrice}`,
        },
      },
    },
  });

  if (body.data.productVariantCreate?.userErrors) {
    throw new Error(body.data.productVariantCreate.userErrors[0].message);
  }

  return body.data.productVariantCreate?.productVariant;
};

const CREATE_VARIANT = `#graphql
  mutation productVariantCreate($input: ProductVariantInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
        title
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
