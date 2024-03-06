import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerBlockedServiceRange } from "../../services/blocked/range";

export type CustomerBlockedControllerRangeRequest = {
  query: z.infer<typeof CustomerBlockedControllerRangeQuerySchema>;
};

export const CustomerBlockedControllerRangeQuerySchema = z.object({
  customerId: NumberOrStringType,
  start: z.string(),
  end: z.string(),
});

export type CustomerBlockedControllerRangeQueryResponse = Awaited<
  ReturnType<typeof CustomerBlockedServiceRange>
>;

export const CustomerBlockedControllerRange = _(
  ({ query }: CustomerBlockedControllerRangeRequest) => {
    const validateData = CustomerBlockedControllerRangeQuerySchema.parse(query);
    return CustomerBlockedServiceRange(validateData);
  }
);
