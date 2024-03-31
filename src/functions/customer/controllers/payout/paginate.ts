import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { CustomerPayoutServicePaginate } from "../../services/payout/paginate";

export type CustomerPayoutControllerPaginateRequest = {
  query: z.infer<typeof CustomerPayoutControllerPaginateSchema>;
};

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const CustomerPayoutControllerPaginateSchema = z.object({
  page: NumberOrStringType,
  limit: NumberOrStringType.optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
  customerId: NumberOrStringType,
});

export type CustomerPayoutControllerPaginateResponse = Awaited<
  ReturnType<typeof CustomerPayoutServicePaginate>
>;

export const CustomerPayoutControllerPaginate = _(
  async ({ query }: CustomerPayoutControllerPaginateRequest) => {
    const validateData = CustomerPayoutControllerPaginateSchema.parse(query);
    return CustomerPayoutServicePaginate(validateData);
  }
);
