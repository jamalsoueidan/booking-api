import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";

import { _ } from "~/library/handler";
import { ScheduleProductServiceCreateOrUpdate } from "../../services/product";

export type ScheduleProductControllerCreateOrUpdateRequest = {
  query: z.infer<typeof ScheduleProductControllerCreateOrUpdateQuerySchema>;
  body: z.infer<typeof ScheduleProductControllerCreateOrUpdateBodySchema>;
};

const ScheduleProductControllerCreateOrUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

const ScheduleProductControllerCreateOrUpdateBodySchema =
  ScheduleProductZodSchema.omit({ productId: true });

export type ScheduleProductControllerCreateOrUpdateResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceCreateOrUpdate>
>;

export const ScheduleProductControllerCreateOrUpdate = _(
  ({ query, body }: ScheduleProductControllerCreateOrUpdateRequest) => {
    const validateQuery =
      ScheduleProductControllerCreateOrUpdateQuerySchema.parse(query);
    const validateBody =
      ScheduleProductControllerCreateOrUpdateBodySchema.parse(body);

    return ScheduleProductServiceCreateOrUpdate(validateQuery, validateBody);
  }
);
