import { ScheduleModel } from "~/functions/schedule";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductOptionsDestroyProps = {
  customerId: number;
  parentId: number;
  productId: number;
};

export async function CustomerProductOptionsDestroyService({
  customerId,
  parentId,
  productId,
}: CustomerProductOptionsDestroyProps) {
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DESTROY, {
    variables: {
      productId: `gid://shopify/Product/${productId}`,
    },
  });

  return ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": parentId,
    },
    {
      $pull: {
        "products.$.options": { productId },
      },
    }
  );
}

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($productId: ID!) {
    productDeleteAsync(productId: $productId) {
      job {
        done
        id
      }
    }
  }
` as const;
