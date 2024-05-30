import { z } from "zod";

import { ScheduleZodSchema } from "~/functions/schedule";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { CustomerScheduleUpdateOrchestration } from "../../orchestrations/schedule/update";
import { CustomerScheduleSlotServiceUpdate } from "../../services/schedule/slots";

export type CustomerScheduleSlotControllerUpdateRequest = {
  query: z.infer<typeof CustomerScheduleSlotControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerScheduleSlotControllerUpdateBodySchema>;
  context: InvocationContext;
};

const CustomerScheduleSlotControllerUpdateQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

const CustomerScheduleSlotControllerUpdateBodySchema = ScheduleZodSchema.pick({
  slots: true,
}).strip();

export type CustomerScheduleSlotControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerScheduleSlotServiceUpdate>
>;

export const CustomerScheduleSlotControllerUpdate = _(
  async ({
    query,
    body,
    context,
  }: CustomerScheduleSlotControllerUpdateRequest) => {
    const validateQuery =
      CustomerScheduleSlotControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerScheduleSlotControllerUpdateBodySchema.parse(body);

    const scheduleUpdated = await CustomerScheduleSlotServiceUpdate(
      validateQuery,
      validateBody.slots
    );

    await CustomerScheduleUpdateOrchestration(validateQuery, context);

    return scheduleUpdated;
  }
);
