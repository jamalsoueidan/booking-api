import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductServiceDestroyFilter = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductServiceDestroy = async (
  filter: CustomerProductServiceDestroyFilter
) => {
  try {
    await shopifyAdmin.request(PRODUCT_DESTROY, {
      variables: {
        productId: `gid://shopify/Product/${filter.productId}`,
      },
    });

    return ScheduleModel.updateOne(
      {
        customerId: filter.customerId,
        products: {
          $elemMatch: {
            productId: filter.productId,
          },
        },
      },
      { $pull: { products: { productId: filter.productId } } },
      { new: true }
    ).lean();
  } catch (error) {
    console.error("Error destroying product:", error);
  }
};

export const PRODUCT_DESTROY = `#graphql
  mutation productDestroy($productId: ID!) {
    productDelete(input: {id: $productId}) {
      deletedProductId
    }
  }
` as const;
