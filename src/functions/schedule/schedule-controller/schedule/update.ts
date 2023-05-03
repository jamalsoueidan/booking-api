import { z } from "zod";
import { ScheduleServiceUpdate } from "~/functions/schedule/schedule-service/schedule";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";

export type ScheduleControllerUpdateRequest = {
  query: z.infer<typeof ScheduleControllerUpdateQuerySchema>;
  body: z.infer<typeof ScheduleControllerUpdateBodySchema>;
};

const ScheduleControllerUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const ScheduleControllerUpdateBodySchema = ScheduleZodSchema.pick({
  name: true,
});

export type ScheduleControllerUpdateResponse = Awaited<
  ReturnType<typeof ScheduleServiceUpdate>
>;

export const ScheduleControllerUpdate = _(
  ({ query, body }: ScheduleControllerUpdateRequest) => {
    const validateQuery = ScheduleControllerUpdateQuerySchema.parse(query);
    const validateBody = ScheduleControllerUpdateBodySchema.parse(body);
    return ScheduleServiceUpdate(validateQuery, validateBody);
  }
);
