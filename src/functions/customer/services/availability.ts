import { Types } from "mongoose";
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
  locationId: string | Types.ObjectId;
};

export type CustomerAvailabilityServiceGetBody = {
  productIds: Array<ScheduleProduct["productId"]>;
  startDate: string;
  destination?: {
    fullAddress: string;
  };
};

export const CustomerAvailabilityServiceGet = async (
  filter: CustomerAvailabilityServiceGetProps,
  body: CustomerAvailabilityServiceGetBody
) => {
  const schedule = await ScheduleModel.findOne({
    customerId: filter.customerId,
    "products.productId": { $all: body.productIds },
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
    body.productIds.includes(productId)
  );

  const availability = await generateAvailability({
    schedule,
    startDate: body.startDate,
  });

  const date = findStartAndEndDate(availability);
  const booked = await CustomerBookingServiceGetBooked({
    customerId: filter.customerId,
    startDate: date.startDate,
    endDate: date.endDate,
  });

  return removeBookedSlots(availability, booked);
};
