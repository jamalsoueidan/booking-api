import { ScheduleModel } from "~/functions/schedule";
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
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DESTROY, {
    variables: {
      productId: `gid://shopify/Product/${optionProductId}`,
    },
  });

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $pull: {
        "products.$.options": { productId: optionProductId },
      },
    }
  );

  return data?.productDelete;
}

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;
