import { z } from "zod";

import { InvocationContext } from "@azure/functions";
import { ScheduleZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";
import { CustomerScheduleCreateOrchestration } from "../../orchestrations/schedule/create";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";

export type CustomerScheduleControllerCreateRequest = {
  query: z.infer<typeof CustomerScheduleControllerCreateQuerySchema>;
  body: z.infer<typeof CustomerScheduleControllerCreateBodySchema>;
  context: InvocationContext;
};

const CustomerScheduleControllerCreateQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
});

const CustomerScheduleControllerCreateBodySchema = ScheduleZodSchema.pick({
  name: true,
});

export type CustomerScheduleControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerScheduleServiceCreate>
>;

export const CustomerScheduleControllerCreate = _(
  async ({ query, body, context }: CustomerScheduleControllerCreateRequest) => {
    const validateQuery =
      CustomerScheduleControllerCreateQuerySchema.parse(query);
    const validateBody = CustomerScheduleControllerCreateBodySchema.parse(body);
    const schedule = await CustomerScheduleServiceCreate({
      ...validateQuery,
      ...validateBody,
    });

    await CustomerScheduleCreateOrchestration(
      { scheduleId: schedule._id, customerId: validateQuery.customerId },
      context
    );

    return schedule;
  }
);
