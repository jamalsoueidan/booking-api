import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { ScheduleProductServiceDestroy } from "~/functions/schedule/services/product";
import { _ } from "~/library/handler";

export type ScheduleProductControllerDestroyRequest = {
  query: z.infer<typeof ScheduleProductControllerDestroyQuerySchema>;
};

const ScheduleProductControllerDestroyQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type ScheduleProductControllerDestroyResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceDestroy>
>;

export const ScheduleProductControllerDestroy = _(
  ({ query }: ScheduleProductControllerDestroyRequest) => {
    const validateQuery =
      ScheduleProductControllerDestroyQuerySchema.parse(query);
    return ScheduleProductServiceDestroy(validateQuery);
  }
);
