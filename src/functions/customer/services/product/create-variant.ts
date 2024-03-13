import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductServiceCreateVariantProps = {
  productId: number;
  price: number;
  compareAtPrice: number;
};

export const CustomerProductServiceCreateVariant = async (
  props: CustomerProductServiceCreateVariantProps
) => {
  const { data } = await shopifyAdmin.request(CREATE_VARIANT, {
    variables: {
      input: {
        price: props.price,
        compareAtPrice: props.compareAtPrice,
        productId: `gid://shopify/Product/${props.productId}`,
        inventoryItem: {
          tracked: false,
        },
        options: [`Artist ${props.price}.${props.compareAtPrice}`],
      },
    },
  });

  if (
    data &&
    data.productVariantCreate &&
    data.productVariantCreate?.userErrors.length > 0
  ) {
    throw data.productVariantCreate.userErrors[0];
  }

  return data?.productVariantCreate?.productVariant;
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
