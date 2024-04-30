import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrString, StringOrObjectIdType } from "~/library/zod";
import { CustomerBlockedServiceList } from "../../services/blocked/list";

export type CustomerBlockedControllerListRequest = {
  query: z.infer<typeof CustomerBlockedControllerListSchema>;
};

export const CustomerBlockedControllerListSchema = z.object({
  customerId: NumberOrString,
  limit: NumberOrString.optional(),
  nextCursor: StringOrObjectIdType.optional(),
});

export type CustomerBlockedControllerListResponse = Awaited<
  ReturnType<typeof CustomerBlockedServiceList>
>;

export const CustomerBlockedControllerList = _(
  ({ query }: CustomerBlockedControllerListRequest) => {
    const validateData = CustomerBlockedControllerListSchema.parse(query);
    return CustomerBlockedServiceList(validateData);
  }
);
