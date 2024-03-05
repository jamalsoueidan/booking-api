import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { CustomerBlockedServiceList } from "../../services/blocked/list";

export type CustomerBlockedControllerRangeRequest = {
  query: z.infer<typeof CustomerBlockedControllerRangeQuerySchema>;
};

export const CustomerBlockedControllerRangeQuerySchema = z.object({
  customerId: NumberOrStringType,
  limit: NumberOrStringType,
  nextCursor: StringOrObjectIdType,
});

export type CustomerBlockedControllerRangeQueryResponse = Awaited<
  ReturnType<typeof CustomerBlockedServiceList>
>;

export const CustomerBlockedControllerRange = _(
  ({ query }: CustomerBlockedControllerRangeRequest) => {
    const validateData = CustomerBlockedControllerRangeQuerySchema.parse(query);
    return CustomerBlockedServiceList(validateData);
  }
);
