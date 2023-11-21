import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { UserAvailabilityServiceGet } from "../../services/availability/get";

export type UserAvailabilityControllerGetRequest = {
  query: z.infer<typeof QuerySchema>;
  body: z.infer<typeof BodySchema>;
};

const QuerySchema = z.object({
  username: z.string(),
  locationId: StringOrObjectIdType,
});

const BodySchema = z.object({
  productIds: z.array(NumberOrStringType),
  fromDate: z.string(),
  toDate: z.string(),
  shippingId: z.union([z.string(), z.undefined()]),
});

export type UserAvailabilityControllerGetResponse = Awaited<
  ReturnType<typeof UserAvailabilityServiceGet>
>;

export const UserAvailabilityControllerGet = _(
  async ({ query, body }: UserAvailabilityControllerGetRequest) => {
    const filter = QuerySchema.parse(query);
    const validBody = BodySchema.parse(body);
    return UserAvailabilityServiceGet(filter, validBody);
  }
);
