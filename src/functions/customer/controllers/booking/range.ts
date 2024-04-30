import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString } from "~/library/zod";
import { CustomerBookingServiceRange } from "../../services/booking/range";

export type CustomerBookingControllerRangeRequest = {
  query: z.infer<typeof CustomerBookingControllerRangeSchema>;
};

export const CustomerBookingControllerRangeSchema = z.object({
  customerId: NumberOrString,
  start: z.string(),
  end: z.string(),
});

export type CustomerBookingControllerRangeResponse = Awaited<
  ReturnType<typeof CustomerBookingServiceRange>
>;

export const CustomerBookingControllerRange = _(
  async ({ query }: CustomerBookingControllerRangeRequest) => {
    const validateData = CustomerBookingControllerRangeSchema.parse(query);
    return CustomerBookingServiceRange(validateData);
  }
);
