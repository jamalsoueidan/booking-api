import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { ScheduleSlotServiceUpdate } from "~/functions/schedule/services";
import { _ } from "~/library/handler";

export type ScheduleSlotControllerUpdateRequest = {
  query: z.infer<typeof ScheduleSlotControllerUpdateQuerySchema>;
  body: z.infer<typeof ScheduleSlotControllerUpdateBodySchema>;
};

const ScheduleSlotControllerUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const ScheduleSlotControllerUpdateBodySchema = ScheduleZodSchema.shape.slots;

export type ScheduleSlotControllerUpdateResponse = Awaited<
  ReturnType<typeof ScheduleSlotServiceUpdate>
>;

export const ScheduleSlotControllerUpdate = _(
  ({ query, body }: ScheduleSlotControllerUpdateRequest) => {
    const validateQuery = ScheduleSlotControllerUpdateQuerySchema.parse(query);
    const validateBody = ScheduleSlotControllerUpdateBodySchema.parse(body);
    return ScheduleSlotServiceUpdate(validateQuery, validateBody);
  }
);
