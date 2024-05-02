import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { CustomerProductServiceGet } from "../product/get";

export type CustomerProductOptionsUpdateServiceProps = {
  customerId: number;
  productId: number;
  optionProductId: number;
};

export type CustomerProductOptionsUpdateServiceBody = Array<{
  id: number;
  price: number;
  duration: number;
}>;

export async function CustomerProductOptionsUpdateService(
  props: CustomerProductOptionsUpdateServiceProps,
  body: CustomerProductOptionsUpdateServiceBody
) {
  const product = await CustomerProductServiceGet({
    customerId: props.customerId,
    productId: props.productId,
  });

  const option = product.options?.find(
    (o) => o.productId === props.optionProductId
  );

  if (!option) {
    throw new NotFoundError([
      {
        path: ["customerId", "parentId", "productId"],
        message: "OPTION_NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  // first time we wouldn't have the metafieldId on our side.
  let requestToUpdateMetafieldId = false;

  const variants = body.map((variant) => {
    const dbVariant = option.variants.find((v) => v.variantId === variant.id);
    if (!dbVariant) {
      throw new NotFoundError([
        {
          path: ["customerId", "optionId", "variantId"],
          message: "OPTION_VARIANT_UNKNOWN",
          code: "custom",
        },
      ]);
    }

    const id = dbVariant.duration.metafieldId
      ? `gid://shopify/Metafield/${dbVariant.duration.metafieldId}`
      : undefined;

    if (!id) {
      requestToUpdateMetafieldId = true;
    }

    return {
      id: `gid://shopify/ProductVariant/${variant.id}`,
      price: variant.price.toString(),
      metafields: [
        {
          ...(id ? { id } : {}),
          value: dbVariant.duration.value.toString(),
          type: "number_integer",
        },
      ],
    };
  });

  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_UPDATE, {
    variables: {
      productId: `gid://shopify/Product/${props.optionProductId}`,
      variants,
    },
  });

  if (requestToUpdateMetafieldId) {
  }

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
          metafield(key: "duration", namespace: "booking") {
            id
          }
        }
      }
    }
  }
}
` as const;
