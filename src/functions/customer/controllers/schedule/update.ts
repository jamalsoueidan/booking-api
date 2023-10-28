import { z } from "zod";

import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerScheduleServiceUpdate } from "../../services/schedule/update";

export type CustomerScheduleControllerUpdateRequest = {
  query: z.infer<typeof CustomerScheduleControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerScheduleControllerUpdateBodySchema>;
};

const CustomerScheduleControllerUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const CustomerScheduleControllerUpdateBodySchema = ScheduleZodSchema.pick({
  name: true,
});

export type CustomerScheduleControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerScheduleServiceUpdate>
>;

export const CustomerScheduleControllerUpdate = _(
  ({ query, body }: CustomerScheduleControllerUpdateRequest) => {
    const validateQuery =
      CustomerScheduleControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerScheduleControllerUpdateBodySchema.parse(body);
    return CustomerScheduleServiceUpdate(validateQuery, validateBody);
  }
);
