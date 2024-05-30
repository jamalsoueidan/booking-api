import { z } from "zod";

import { InvocationContext } from "@azure/functions";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerScheduleUpdateOrchestration } from "../../orchestrations/schedule/update";
import { CustomerScheduleServiceUpdate } from "../../services/schedule/update";

export type CustomerScheduleControllerUpdateRequest = {
  query: z.infer<typeof CustomerScheduleControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerScheduleControllerUpdateBodySchema>;
  context: InvocationContext;
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
  async ({ query, body, context }: CustomerScheduleControllerUpdateRequest) => {
    const validateQuery =
      CustomerScheduleControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerScheduleControllerUpdateBodySchema.parse(body);

    const scheduleUpdated = await CustomerScheduleServiceUpdate(
      validateQuery,
      validateBody
    );

    await CustomerScheduleUpdateOrchestration(validateQuery, context);

    return scheduleUpdated;
  }
);
