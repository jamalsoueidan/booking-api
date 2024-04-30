import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString, ObjectIdType } from "~/library/zod";
import { CustomerPayoutLogServicePaginate } from "../../services/payout-log/paginate";

export type CustomerPayoutLogControllerPaginateRequest = {
  query: z.infer<typeof CustomerPayoutLogControllerPaginateSchema>;
};

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const CustomerPayoutLogControllerPaginateSchema = z.object({
  page: NumberOrString,
  limit: NumberOrString.optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
  customerId: NumberOrString,
  payoutId: ObjectIdType,
});

export type CustomerPayoutLogControllerPaginateResponse = Awaited<
  ReturnType<typeof CustomerPayoutLogServicePaginate>
>;

export const CustomerPayoutLogControllerPaginate = _(
  async ({ query }: CustomerPayoutLogControllerPaginateRequest) => {
    const validateData = CustomerPayoutLogControllerPaginateSchema.parse(query);
    return CustomerPayoutLogServicePaginate(validateData);
  }
);
