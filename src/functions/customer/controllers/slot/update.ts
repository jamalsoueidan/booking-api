import { z } from "zod";
import { CustomerScheduleSlotServiceUpdate } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule";

import { _ } from "~/library/handler";

export type CustomerScheduleSlotControllerUpdateRequest = {
  query: z.infer<typeof CustomerScheduleSlotControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerScheduleSlotControllerUpdateBodySchema>;
};

const CustomerScheduleSlotControllerUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const CustomerScheduleSlotControllerUpdateBodySchema =
  ScheduleZodSchema.shape.slots;

export type CustomerScheduleSlotControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerScheduleSlotServiceUpdate>
>;

export const CustomerScheduleSlotControllerUpdate = _(
  ({ query, body }: CustomerScheduleSlotControllerUpdateRequest) => {
    const validateQuery =
      CustomerScheduleSlotControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerScheduleSlotControllerUpdateBodySchema.parse(body);
    return CustomerScheduleSlotServiceUpdate(validateQuery, validateBody);
  }
);
