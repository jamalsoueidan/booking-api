import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceRange } from "../../services/order/range";

export type CustomerOrderControllerRangeRequest = {
  query: z.infer<typeof CustomerOrderControllerRangeSchema>;
};

export const CustomerOrderControllerRangeSchema = z.object({
  customerId: NumberOrStringType,
  start: z.string(),
  end: z.string(),
});

export type CustomerOrderControllerRangeResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceRange>
>;

export const CustomerOrderControllerRange = _(
  async ({ query }: CustomerOrderControllerRangeRequest) => {
    const validateData = CustomerOrderControllerRangeSchema.parse(query);
    return CustomerOrderServiceRange(validateData);
  }
);
