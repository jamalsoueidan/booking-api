import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError, ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceGet } from "../product/get";
import { mergeArraysUnique } from "../product/update";

export type CustomerProductOptionsServiceUpdateProps = {
  customerId: number;
  productId: number;
  optionProductId: number;
};

export type CustomerProductOptionsServiceUpdateBody = {
  variants: Array<{
    id: number;
    price: number;
    duration: number;
  }>;
};

export async function CustomerProductOptionsServiceUpdate(
  props: CustomerProductOptionsServiceUpdateProps,
  body: CustomerProductOptionsServiceUpdateBody
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

  const variants = body.variants.map((variant) => {
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

    return {
      id: `gid://shopify/ProductVariant/${variant.id}`,
      price: variant.price.toString(),
      metafields: [
        {
          id: `gid://shopify/Metafield/${dbVariant.duration.metafieldId}`,
          value: variant.duration.toString(),
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

  if (!data?.productVariantsBulkUpdate?.product) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  // these could maybe come from webhook update
  const updatedOption =
    data.productVariantsBulkUpdate.product.variants.nodes.map((node) => ({
      variantId: GidFormat.parse(node.id),
      title: node.title,
      price: node.price,
      duration: {
        value: parseInt(node.duration?.value || "", 10) || 60,
        metafieldId: GidFormat.parse(node.duration?.id),
      },
    })) || [];

  const newProduct = {
    ...product,
    options: mergeArraysUnique(
      product?.options || [],
      [
        {
          productId: props.optionProductId,
          title: data.productVariantsBulkUpdate.product.title,
          variants: updatedOption,
          required: option.required,
        },
      ],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId: props.customerId,
      "products.productId": props.productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return updatedOption;
}

export const PRODUCT_OPTION_UPDATE = `#graphql
  mutation productOptionUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!] = {}) {
  productVariantsBulkUpdate(
    productId: $productId,
    variants: $variants
  ) {
    product {
      id
      title
      variants(first: 5) {
        nodes {
          id
          title
          price
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
