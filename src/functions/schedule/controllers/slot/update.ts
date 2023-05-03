import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { ScheduleServiceUpdateSlot } from "~/functions/schedule/services";
import { _ } from "~/library/handler";

export type ScheduleControllerUpdateSlotRequest = {
  query: z.infer<typeof ScheduleControllerUpdateSlotQuerySchema>;
  body: z.infer<typeof ScheduleControllerUpdateSlotBodySchema>;
};

const ScheduleControllerUpdateSlotQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const ScheduleControllerUpdateSlotBodySchema = ScheduleZodSchema.shape.slots;

export type ScheduleControllerUpdateSlotResponse = Awaited<
  ReturnType<typeof ScheduleServiceUpdateSlot>
>;

export const ScheduleControllerUpdateSlot = _(
  ({ query, body }: ScheduleControllerUpdateSlotRequest) => {
    const validateQuery = ScheduleControllerUpdateSlotQuerySchema.parse(query);
    const validateBody = ScheduleControllerUpdateSlotBodySchema.parse(body);
    return ScheduleServiceUpdateSlot(validateQuery, validateBody);
  }
);
