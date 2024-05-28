import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

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
          message: "PRODUCT_OPTION_NOT_FOUND",
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
