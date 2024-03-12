import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type CustomerProductServiceGetFilter = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductServiceGet = async (
  filter: CustomerProductServiceGetFilter
) => {
  const schedule = await ScheduleModel.findOne({
    customerId: filter.customerId,
    products: {
      $elemMatch: {
        productId: filter.productId,
      },
    },
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCT_NOT_FOUND",
          path: ["productId"],
        },
      ])
    )
    .lean();

  const product = schedule.products.find(
    (p) => p.productId === filter.productId
  );

  if (!product) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  return {
    ...product,
    scheduleId: schedule._id,
    scheduleName: schedule.name,
  };
};
