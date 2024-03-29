import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { UserAvailabilityServiceGenerate } from "../../services/availability/generate";

export type UserAvailabilityControllerGenerateRequest = {
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
  shippingId: z.union([z.string(), z.undefined()]),
});

export type UserAvailabilityControllerGenerateResponse = Awaited<
  ReturnType<typeof UserAvailabilityServiceGenerate>
>;

export const UserAvailabilityControllerGenerate = _(
  async ({ query, body }: UserAvailabilityControllerGenerateRequest) => {
    const filter = QuerySchema.parse(query);
    const validBody = BodySchema.parse(body);
    return UserAvailabilityServiceGenerate(filter, validBody);
  }
);
