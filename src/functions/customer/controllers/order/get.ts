import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceGet } from "../../services/order/get";

export type CustomerOrderControllerGetRequest = {
  query: z.infer<typeof CustomerOrderControllerGetSchema>;
};

export const CustomerOrderControllerGetSchema = z.object({
  customerId: NumberOrStringType,
  orderId: NumberOrStringType,
  groupId: z.string(),
});

export type CustomerOrderControllerGetResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceGet>
>;

export const CustomerOrderControllerGet = _(
  async ({ query }: CustomerOrderControllerGetRequest) => {
    const validateData = CustomerOrderControllerGetSchema.parse(query);
    return CustomerOrderServiceGet(validateData);
  }
);
