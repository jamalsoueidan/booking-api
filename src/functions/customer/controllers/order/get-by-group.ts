import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerOrderServiceGetByGroup } from "../../services/order/get-by-group";

export type CustomerOrderControllerGetByGroupRequest = {
  query: z.infer<typeof CustomerOrderControllerGetByGroupSchema>;
};

export const CustomerOrderControllerGetByGroupSchema = z.object({
  customerId: NumberOrStringType,
  orderId: NumberOrStringType,
  groupId: z.string(),
});

export type CustomerOrderControllerGetByGroupResponse = Awaited<
  ReturnType<typeof CustomerOrderServiceGetByGroup>
>;

export const CustomerOrderControllerGetByGroup = _(
  async ({ query }: CustomerOrderControllerGetByGroupRequest) => {
    const validateData = CustomerOrderControllerGetByGroupSchema.parse(query);
    return CustomerOrderServiceGetByGroup(validateData);
  }
);
