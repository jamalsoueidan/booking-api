import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceGetShipping } from "../../services/order/get-shipping";

export type CustomerOrderControllerGetShippingRequest = {
  query: z.infer<typeof CustomerOrderControllerGetShippingSchema>;
};

export const CustomerOrderControllerGetShippingSchema = z.object({
  customerId: NumberOrStringType,
  id: NumberOrStringType,
});

export type CustomerOrderControllerGetResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceGetShipping>
>;

export const CustomerOrderControllerGetShipping = _(
  async ({ query }: CustomerOrderControllerGetShippingRequest) => {
    const validateData = CustomerOrderControllerGetShippingSchema.parse(query);
    return CustomerOrderServiceGetShipping(validateData);
  }
);
