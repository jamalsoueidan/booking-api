import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceShipping } from "../../services/order/shipping";

export type CustomerOrderControllerShippingRequest = {
  query: z.infer<typeof CustomerOrderControllerShippingSchema>;
};

export const CustomerOrderControllerShippingSchema = z.object({
  customerId: NumberOrStringType,
  start: z.string(),
  end: z.string(),
});

export type CustomerOrderControllerListResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceShipping>
>;

export const CustomerOrderControllerShipping = _(
  async ({ query }: CustomerOrderControllerShippingRequest) => {
    const validateData = CustomerOrderControllerShippingSchema.parse(query);
    return CustomerOrderServiceShipping(validateData);
  }
);
