import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import {
  findStartAndEndDate,
  generateAvailability,
  removeBookedSlots,
} from "~/library/availability";
import { NotFoundError } from "~/library/handler";
import { CustomerBookingServiceGetBooked } from "./booking";

export type CustomerAvailabilityServiceGetProps = {
  customerId: Schedule["customerId"];
  productIds: Array<ScheduleProduct["productId"]>;
  startDate: string;
};

export const CustomerAvailabilityServiceGet = async ({
  customerId,
  productIds,
  startDate,
}: CustomerAvailabilityServiceGetProps) => {
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

  const availability = await generateAvailability({ schedule, startDate });
  const date = findStartAndEndDate(availability);
  const booked = await CustomerBookingServiceGetBooked({
    customerId,
    startDate: date.startDate,
    endDate: date.endDate,
  });

  return removeBookedSlots(availability, booked);
};
