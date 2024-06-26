import {
  ScheduleModel,
  ScheduleProduct,
  ScheduleProductOption,
} from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import { NotFoundError, ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceGet } from "../product/get";
import { mergeArraysUnique } from "../product/update";

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
  const user = await UserModel.findOne({
    customerId,
  })
    .orFail(
      new NotFoundError([
        {
          path: ["customerId"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    )
    .lean();

  const rootProduct = await CustomerProductServiceGet({
    customerId,
    productId,
  });

  const { data } = await shopifyAdmin().request(PRODUCT_OPTION_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/${cloneId}`,
      title, //Afrensning - XXX
    },
  });

  if (!data?.productDuplicate?.newProduct) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  const newOption: ScheduleProductOption = {
    parentIdMetafieldId: data.productDuplicate.newProduct.parentId?.id,
    productId: GidFormat.parse(data.productDuplicate.newProduct.id),
    title: data.productDuplicate.newProduct.title,
    required:
      !data.productDuplicate.newProduct.required ||
      data.productDuplicate.newProduct.required?.value.toLowerCase() === "true",
    variants:
      data.productDuplicate?.newProduct?.variants.nodes.map((variant) => ({
        variantId: GidFormat.parse(variant.id),
        title: variant.title,
        price: variant.price,
        duration: {
          metafieldId: GidFormat.parse(variant.duration?.id),
          value: parseInt(variant.duration?.value || "0"),
        },
      })) || [],
  };

  const newProduct: ScheduleProduct = {
    ...rootProduct,
    options: mergeArraysUnique(
      rootProduct?.options || [],
      [newOption],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return newOption;
}

export const PRODUCT_OPTION_FRAGMENT = `#graphql
  fragment ProductOptionFragment on Product {
    id
    title
    handle
    tags
    required: metafield(key: "required", namespace: "system") {
      id
      value
    }
    parentId: metafield(key: "parentId", namespace: "booking") {
      id
      value
    }
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
` as const;

export const PRODUCT_OPTION_DUPLCATE = `#graphql
  ${PRODUCT_OPTION_FRAGMENT}
  mutation productOptionDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {
      newProduct {
        ...ProductOptionFragment
      }
    }
  }
` as const;
