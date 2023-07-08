import { Types } from "mongoose";
import { Schedule, ScheduleProduct } from "~/functions/schedule";
import {
  findStartAndEndDate,
  generateAvailability,
  removeBookedSlots,
} from "~/library/availability";
import { CustomerBookingServiceGetBooked } from "./booking";
import { CustomerScheduleServiceGetWithCustomer } from "./schedule";

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
  const schedule = await CustomerScheduleServiceGetWithCustomer({
    customerId: filter.customerId,
    productIds: body.productIds,
  });

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
