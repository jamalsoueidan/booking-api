import { z } from "zod";
import { ScheduleServiceDestroy } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";

export type ScheduleControllerDestroyRequest = {
  query: z.infer<typeof ScheduleControllerDestroyQuerySchema>;
};

const ScheduleControllerDestroyQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

export type ScheduleControllerDestroyResponse = Awaited<
  ReturnType<typeof ScheduleServiceDestroy>
>;

export const ScheduleControllerDestroy = _(
  ({ query }: ScheduleControllerDestroyRequest) => {
    const validateQuery = ScheduleControllerDestroyQuerySchema.parse(query);
    return ScheduleServiceDestroy(validateQuery);
  }
);
