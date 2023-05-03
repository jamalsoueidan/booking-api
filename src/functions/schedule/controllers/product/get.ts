import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { ScheduleProductServiceGet } from "~/functions/schedule/services/product";
import { _ } from "~/library/handler";

export type ScheduleProductControllerGetRequest = {
  query: z.infer<typeof ScheduleProductControllerGetQuerySchema>;
};

const ScheduleProductControllerGetQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type ScheduleProductControllerGetResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceGet>
>;

export const ScheduleProductControllerGet = _(
  ({ query }: ScheduleProductControllerGetRequest) => {
    const validateQuery = ScheduleProductControllerGetQuerySchema.parse(query);
    return ScheduleProductServiceGet(validateQuery);
  }
);
