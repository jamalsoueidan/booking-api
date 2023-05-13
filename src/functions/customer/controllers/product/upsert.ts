import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";
import { CustomerProductServiceUpsert } from "../../services";

export type CustomerProductControllerUpsertRequest = {
  query: z.infer<typeof CustomerProductControllerUpsertQuerySchema>;
  body: z.infer<typeof CustomerProductControllerUpsertBodySchema>;
};

const CustomerProductControllerUpsertQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

const CustomerProductControllerUpsertBodySchema = ScheduleProductZodSchema.omit(
  {
    productId: true,
  }
).extend({
  scheduleId: ScheduleZodSchema.shape._id,
});

export type CustomerProductControllerUpsertResponse = Awaited<
  ReturnType<typeof CustomerProductServiceUpsert>
>;

export const CustomerProductControllerUpsert = _(
  ({ query, body }: CustomerProductControllerUpsertRequest) => {
    const validateQuery =
      CustomerProductControllerUpsertQuerySchema.parse(query);
    const validateBody = CustomerProductControllerUpsertBodySchema.parse(body);

    return CustomerProductServiceUpsert(validateQuery, validateBody);
  }
);
