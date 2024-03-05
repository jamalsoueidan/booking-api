import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { CustomerBlockedServiceDestroy } from "../../services/blocked/destroy";
import { CustomerServiceUpdate } from "../../services/customer";

export type CustomerBlockedControllerDestroyRequest = {
  query: z.infer<typeof CustomerBlockedControllerDestroySchema>;
};

export const CustomerBlockedControllerDestroySchema = z.object({
  customerId: NumberOrStringType,
  blockedId: StringOrObjectIdType,
});

export type CustomerBlockedControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerServiceUpdate>
>;

export const CustomerBlockedControllerCreate = _(
  ({ query }: CustomerBlockedControllerDestroyRequest) => {
    const validateBody = CustomerBlockedControllerDestroySchema.parse(query);
    return CustomerBlockedServiceDestroy(query);
  }
);
