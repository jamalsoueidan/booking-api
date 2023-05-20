import { _ } from "~/library/handler";

import { z } from "zod";
import { BookingModeSchema } from "~/functions/booking";
import { NumberOrStringType } from "~/library/zod";
import { CustomerBookingServiceList } from "../../services/booking";

export type CustomerBookingControllerListRequest = {
  query: z.infer<typeof CustomerBookingControllerListSchema>;
};

export const CustomerBookingControllerListSchema = z.object({
  customerId: NumberOrStringType,
  mode: BookingModeSchema,
});

export type CustomerBookingControllerListResponse = Awaited<
  ReturnType<typeof CustomerBookingServiceList>
>;

export const CustomerBookingControllerList = _(
  async ({ query }: CustomerBookingControllerListRequest) => {
    const validateData = CustomerBookingControllerListSchema.parse(query);
    return CustomerBookingServiceList(validateData);
  }
);
