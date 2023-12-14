import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceGetLineItem } from "../../services/order/get-lineitem";

export type CustomerOrderControllerGetLineItemRequest = {
  query: z.infer<typeof CustomerOrderControllerGetLineItemSchema>;
};

export const CustomerOrderControllerGetLineItemSchema = z.object({
  customerId: NumberOrStringType,
  lineItemId: NumberOrStringType,
});

export type CustomerOrderControllerGetLineItemResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceGetLineItem>
>;

export const CustomerOrderControllerGetLineItem = _(
  async ({ query }: CustomerOrderControllerGetLineItemRequest) => {
    const validateData = CustomerOrderControllerGetLineItemSchema.parse(query);
    return CustomerOrderServiceGetLineItem(validateData);
  }
);
