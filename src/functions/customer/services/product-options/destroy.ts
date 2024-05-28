import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { PRODUCT_PARENT_UPDATE } from "./add";

export type CustomerProductOptionsDestroyProps = {
  customerId: number;
  optionProductId: number;
  productId: number;
};

export async function CustomerProductOptionsServiceDestroy({
  customerId,
  optionProductId,
  productId,
}: CustomerProductOptionsDestroyProps) {
  await shopifyAdmin().request(PRODUCT_OPTION_DESTROY, {
    variables: {
      productId: `gid://shopify/Product/${optionProductId}`,
    },
  });

  const schedule = await ScheduleModel.findOneAndUpdate(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $pull: {
        "products.$.options": { productId: optionProductId },
      },
    },
    {
      new: true,
    }
  )
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["customerId", "productId"],
          message: "PRODUCT_NOT_FOUND",
          code: "custom",
        },
      ])
    );

  const product = schedule.products.find((p) => p.productId === productId);

  if (!product) {
    throw new NotFoundError([
      {
        path: ["customerId", "productId"],
        message: "PRODUCT_NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  if (product.options?.length === 0) {
    await shopifyAdmin().request(PRODUCT_DESTROY_METAFIELD, {
      variables: {
        metafieldId: product.optionsMetafieldId || "",
      },
    });

    await ScheduleModel.updateOne(
      {
        customerId,
        "products.productId": productId,
      },
      {
        $set: {
          "products.$": { ...product, optionsMetafieldId: null },
        },
      }
    );
  } else {
    await shopifyAdmin().request(PRODUCT_PARENT_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${productId}`,
        metafields: [
          {
            id: product.optionsMetafieldId,
            value: JSON.stringify(product.options?.map((o) => o.productId)),
          },
        ],
      },
    });
  }

  return product.options;
}

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;

export const PRODUCT_DESTROY_METAFIELD = `#graphql
  mutation productDestroyMetafield($metafieldId: ID!){
    metafieldDelete(input: {id: $metafieldId}) {
      deletedId
    }
  }
` as const;
