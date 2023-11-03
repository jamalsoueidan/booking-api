import { Types } from "mongoose";

import { Schedule, ScheduleProduct } from "~/functions/schedule";
import { ShippingServiceGet } from "~/functions/shipping/services/get";
import { findStartAndEndDate } from "~/library/availability/find-start-end-date-in-availability";
import { generateAvailability } from "~/library/availability/generate-availability";
import { removeBookedSlots } from "~/library/availability/remove-booked-slots";
import { CustomerBookingServiceGetBooked } from "./booking";
import { CustomerScheduleServiceGetWithCustomer } from "./schedule/get-with-customer";

export type CustomerAvailabilityServiceGetProps = {
  customerId: Schedule["customerId"];
  locationId: string | Types.ObjectId;
};

export type CustomerAvailabilityServiceGetBody = {
  productIds: Array<ScheduleProduct["productId"]>;
  startDate: string;
  shippingId?: string | Types.ObjectId;
};

/**
 * Gets customer availability by filtering for customer ID and location, generating availability from schedule, removing booked slots, and returning filtered availability.
 *
 * @param filter - Filter parameters including customer ID and location ID
 * @param body - Request body including product IDs, start date
 * @returns Filtered customer availability with booked slots removed
 */
export const CustomerAvailabilityServiceGet = async (
  filter: CustomerAvailabilityServiceGetProps,
  body: CustomerAvailabilityServiceGetBody
) => {
  const schedule = await CustomerScheduleServiceGetWithCustomer({
    customerId: filter.customerId,
    productIds: body.productIds,
  });

  let shipping: Awaited<ReturnType<typeof ShippingServiceGet>> | undefined;
  if (body.shippingId) {
    shipping = await ShippingServiceGet({
      shippingId: body.shippingId,
    });
  }

  const availability = await generateAvailability({
    schedule,
    shipping,
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
