import { Types } from "mongoose";
import { CustomerBookingServiceGetBooked } from "~/functions/customer/services/booking";
import { UserScheduleServiceGetWithCustomer } from "~/functions/user/services/schedule/get-with-customer";

import { ScheduleProduct } from "~/functions/schedule";
import { ShippingServiceGet } from "~/functions/shipping/services/get";
import { findStartAndEndDate } from "~/library/availability/find-start-end-date-in-availability";
import { generateAvailability } from "~/library/availability/generate-availability";
import { removeBookedSlots } from "~/library/availability/remove-booked-slots";
import { StringOrObjectId } from "~/library/zod";
import { UserServiceGetCustomerId } from "../user";

export type UserAvailabilityServiceGenerateProps = {
  username: string;
  locationId: StringOrObjectId;
};

export type UserAvailabilityServiceGenerateBody = {
  productIds: Array<ScheduleProduct["productId"]>;
  fromDate: string;
  toDate?: string;
  shippingId?: string | Types.ObjectId;
};

/**
 * Gets customer availability by filtering for customer ID and location, generating availability from schedule, removing booked slots, and returning filtered availability.
 *
 * @param filter - Filter parameters including customer ID and location ID
 * @param body - Request body including product IDs, start date
 * @returns Filtered customer availability with booked slots removed
 */
export const UserAvailabilityServiceGenerate = async (
  filter: UserAvailabilityServiceGenerateProps,
  body: UserAvailabilityServiceGenerateBody
) => {
  const user = await UserServiceGetCustomerId({ username: filter.username });

  const schedule = await UserScheduleServiceGetWithCustomer({
    customerId: user.customerId,
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
    fromDate: body.fromDate,
    toDate: body.toDate,
  });

  const date = findStartAndEndDate(availability);

  const booked = await CustomerBookingServiceGetBooked({
    customerId: user.customerId,
    startDate: date.startDate,
    endDate: date.endDate,
  });

  return removeBookedSlots(availability, booked);
};
