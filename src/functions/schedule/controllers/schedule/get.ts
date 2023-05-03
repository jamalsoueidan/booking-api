import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { ScheduleServiceGet } from "~/functions/schedule/services";
import { _ } from "~/library/handler";

export type ScheduleControllerGetRequest = {
  query: z.infer<typeof ScheduleControllerGetQuerySchema>;
};

const ScheduleControllerGetQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

export type ScheduleControllerGetResponse = Awaited<
  ReturnType<typeof ScheduleServiceGet>
>;

export const ScheduleControllerGet = _(
  ({ query }: ScheduleControllerGetRequest) => {
    const validateQuery = ScheduleControllerGetQuerySchema.parse(query);
    return ScheduleServiceGet(validateQuery);
  }
);
