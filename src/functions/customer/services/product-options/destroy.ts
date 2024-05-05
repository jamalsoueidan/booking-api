import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

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
  await shopifyAdmin.request(PRODUCT_OPTION_DESTROY, {
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
  ).orFail(
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

  return product.options;
}

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;
