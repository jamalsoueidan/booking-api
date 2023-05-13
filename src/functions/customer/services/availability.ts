import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { generateAvailability } from "~/library/availability";
import { NotFoundError } from "~/library/handler";

export type CustomerProductAvailabilityServiceProps = {
  customerId: Schedule["customerId"];
  productIds: Array<ScheduleProduct["productId"]>;
  startDate: string;
};

export const CustomerProductAvailabilityService = async ({
  customerId,
  productIds,
  startDate,
}: CustomerProductAvailabilityServiceProps) => {
  const schedule = await ScheduleModel.findOne({
    customerId,
    "products.productId": { $all: productIds },
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCTS_NOT_FOUND",
          path: ["productIds"],
        },
      ])
    )
    .lean();

  schedule.products = schedule?.products.filter(({ productId }) =>
    productIds.includes(productId)
  );

  return generateAvailability(schedule, startDate);
};
