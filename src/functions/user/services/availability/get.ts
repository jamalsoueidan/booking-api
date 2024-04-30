import { ScheduleProduct } from "~/functions/schedule";
import { StringOrObjectIdType } from "~/library/zod";
import { UserAvailabilityServiceGenerate } from "./generate";

export type UserAvailabilityServiceGenerateProps = {
  username: string;
  locationId: StringOrObjectIdType;
};

export type UserAvailabilityServiceGenerateBody = {
  productIds: Array<ScheduleProduct["productId"]>;
  optionIds?: Record<number, Record<number, number>>;
  fromDate: string;
  toDate: string;
  shippingId?: StringOrObjectIdType;
};

export const UserAvailabilityServiceGet = async (
  filter: UserAvailabilityServiceGenerateProps,
  body: UserAvailabilityServiceGenerateBody
) => {
  const availability = await UserAvailabilityServiceGenerate(filter, body);
  const slot = availability[0].slots.find(
    (slot) =>
      slot.from.toISOString() === body.fromDate &&
      slot.to.toISOString() === body.toDate
  );

  const { slots, ...rest } = availability[0];
  return {
    ...rest,
    slot,
  };
};
