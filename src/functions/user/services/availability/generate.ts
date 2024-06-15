import { Types } from "mongoose";
import {
  UserScheduleServiceGetWithCustomer,
  UserScheduleServiceGetWithCustomerResponse,
} from "~/functions/user/services/schedule/get-with-customer";

import { CustomerBlockedServiceRange } from "~/functions/customer/services/blocked/range";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";
import { ShippingServiceGet } from "~/functions/shipping/services/get";
import { findStartAndEndDate } from "~/library/availability/find-start-end-date-in-availability";
import { generateAvailability } from "~/library/availability/generate-availability";
import { removeBookedSlots } from "~/library/availability/remove-booked-slots";
import { StringOrObjectIdType } from "~/library/zod";

import { NotFoundError } from "~/library/handler";
import { UserServiceGetCustomerId } from "../user/get-customer-id";
import { UserAvailabilityServiceGetOrders } from "./get-orders";

export type UserAvailabilityServiceGenerateProps = {
  username: string;
  locationId: StringOrObjectIdType;
};

export type UserAvailabilityServiceGenerateBody = {
  productIds: Array<ScheduleProduct["productId"]>;
  optionIds?: Record<number, Record<number, number>>;
  fromDate: string;
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

  const optionIds = body?.optionIds || {};

  schedule.products = schedule.products.reduce(
    (products, parentProduct, currentIndex) => {
      products.push(parentProduct);
      parentProduct.options?.forEach((productOption) => {
        const option = optionIds[parentProduct.productId];
        if (!option && productOption.required) {
          throw new NotFoundError([
            {
              path: ["optionIds", parentProduct.productId],
              message: "MISSING_PARENT_ID",
              code: "custom",
            },
          ]);
        }

        if (option) {
          const variantId = option[productOption.productId];
          if (!variantId && productOption.required) {
            throw new NotFoundError([
              {
                path: [
                  "optionIds",
                  parentProduct.productId,
                  productOption.productId,
                ],
                message: `MISSING_PRODUCT_ID ${productOption.productId} in ${parentProduct.productId}`,
                code: "custom",
              },
            ]);
          }

          const variant = productOption.variants.find(
            (v) => v.variantId === variantId
          );

          if (!variant && productOption.required) {
            throw new NotFoundError([
              {
                path: [
                  "optionIds",
                  parentProduct.productId,
                  productOption.productId,
                  variantId,
                ],
                message: "INCORRECT_VARIANT_ID",
                code: "custom",
              },
            ]);
          }

          if (variant) {
            products.push({
              variantId: variant.variantId,
              duration: variant.duration.value,
              productId: productOption.productId,
              breakTime: 0,
              bookingPeriod: {
                unit: TimeUnit.MONTHS,
                value: 12,
              },
              noticePeriod: {
                unit: TimeUnit.HOURS,
                value: 1,
              },
              parentId: parentProduct.productId,
            });
          }
        }
      });
      return products;
    },
    [] as UserScheduleServiceGetWithCustomerResponse["products"]
  );

  let shipping: Awaited<ReturnType<typeof ShippingServiceGet>> | undefined;
  if (body.shippingId) {
    shipping = await ShippingServiceGet({
      shippingId: body.shippingId,
    });
  }

  let availability = await generateAvailability({
    schedule,
    shipping,
    fromDate: body.fromDate,
  });

  if (availability.length === 0) {
    return availability;
  }

  const date = findStartAndEndDate(availability);

  const orders = await UserAvailabilityServiceGetOrders({
    customerId: user.customerId,
    start: date.startDate,
    end: date.endDate,
  });

  availability = removeBookedSlots(availability, orders);

  const blocked = await CustomerBlockedServiceRange({
    customerId: user.customerId,
    start: date.startDate,
    end: date.endDate,
  });

  /*
   * TODO:
   * find customerId if he bought any treatments and block time OUT
   * cart booking time?
   */

  availability = removeBookedSlots(availability, blocked);

  return availability.filter(({ slots }) => slots.length > 0);
};
