import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { ScheduleProductServiceDestroy } from "~/functions/schedule/services/product";
import { _ } from "~/library/handler";

export type CustomerProductControllerDestroyRequest = {
  query: z.infer<typeof CustomerProductControllerDestroyQuerySchema>;
};

const CustomerProductControllerDestroyQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type CustomerProductControllerDestroyResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceDestroy>
>;

export const CustomerProductControllerDestroy = _(
  ({ query }: CustomerProductControllerDestroyRequest) => {
    const validateQuery =
      CustomerProductControllerDestroyQuerySchema.parse(query);
    return ScheduleProductServiceDestroy(validateQuery);
  }
);
