import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerBookingServiceGet } from "../../services/booking";

export type CustomerBookingControllerGetRequest = {
  query: z.infer<typeof CustomerBookingControllerGetSchema>;
};

export const CustomerBookingControllerGetSchema = z.object({
  customerId: NumberOrStringType,
  orderId: NumberOrStringType,
  date: z.coerce.date(),
});

export type CustomerBookingControllerGetResponse = Awaited<
  ReturnType<typeof CustomerBookingServiceGet>
>;

export const CustomerBookingControllerGet = _(
  async ({ query }: CustomerBookingControllerGetRequest) => {
    const validateData = CustomerBookingControllerGetSchema.parse(query);
    return CustomerBookingServiceGet(validateData);
  }
);
