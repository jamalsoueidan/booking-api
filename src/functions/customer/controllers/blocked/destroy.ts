import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { CustomerBlockedServiceDestroy } from "../../services/blocked/destroy";

export type CustomerBlockedControllerDestroyRequest = {
  query: z.infer<typeof CustomerBlockedControllerDestroySchema>;
};

export const CustomerBlockedControllerDestroySchema = z.object({
  customerId: NumberOrStringType,
  blockedId: StringOrObjectIdType,
});

export type CustomerBlockedControllerDestroyResponse = Awaited<
  ReturnType<typeof CustomerBlockedServiceDestroy>
>;

export const CustomerBlockedControlleDestroy = _(
  ({ query }: CustomerBlockedControllerDestroyRequest) => {
    const validateBody = CustomerBlockedControllerDestroySchema.parse(query);
    return CustomerBlockedServiceDestroy(validateBody);
  }
);
