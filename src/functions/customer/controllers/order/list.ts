import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceList } from "../../services/order/list";

export type CustomerOrderControllerListRequest = {
  query: z.infer<typeof CustomerOrderControllerListSchema>;
};

export const CustomerOrderControllerListSchema = z.object({
  customerId: NumberOrStringType,
  start: z.string(),
  end: z.string(),
});

export type CustomerOrderControllerListResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceList>
>;

export const CustomerOrderControllerList = _(
  async ({ query }: CustomerOrderControllerListRequest) => {
    const validateData = CustomerOrderControllerListSchema.parse(query);
    return CustomerOrderServiceList(validateData);
  }
);
