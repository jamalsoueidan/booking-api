import { z } from "zod";
import { ScheduleProductServiceCreateOrUpdate } from "~/functions/schedule";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";

export type CustomerProductControllerUpsertRequest = {
  query: z.infer<typeof CustomerProductControllerUpsertQuerySchema>;
  body: z.infer<typeof CustomerProductControllerUpsertBodySchema>;
};

const CustomerProductControllerUpsertQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

const CustomerProductControllerUpsertBodySchema = ScheduleProductZodSchema.omit(
  { productId: true }
);

export type CustomerProductControllerUpsertResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceCreateOrUpdate>
>;

export const CustomerProductControllerUpsert = _(
  ({ query, body }: CustomerProductControllerUpsertRequest) => {
    const validateQuery =
      CustomerProductControllerUpsertQuerySchema.parse(query);
    const validateBody = CustomerProductControllerUpsertBodySchema.parse(body);

    return ScheduleProductServiceCreateOrUpdate(validateQuery, validateBody);
  }
);
