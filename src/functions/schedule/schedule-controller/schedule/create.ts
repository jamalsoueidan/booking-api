import { z } from "zod";
import { ScheduleServiceCreate } from "~/functions/schedule/schedule-service/schedule";
import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";

export type ScheduleControllerCreateRequest = {
  query: z.infer<typeof ScheduleControllerCreateQuerySchema>;
  body: z.infer<typeof ScheduleControllerCreateBodySchema>;
};

const ScheduleControllerCreateQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
});

const ScheduleControllerCreateBodySchema = ScheduleZodSchema.pick({
  name: true,
});

export type ScheduleControllerCreateResponse = Awaited<
  ReturnType<typeof ScheduleServiceCreate>
>;

export const ScheduleControllerCreate = _(
  ({ query, body }: ScheduleControllerCreateRequest) => {
    const validateQuery = ScheduleControllerCreateQuerySchema.parse(query);
    const validateBody = ScheduleControllerCreateBodySchema.parse(body);
    return ScheduleServiceCreate({ ...validateQuery, ...validateBody });
  }
);
