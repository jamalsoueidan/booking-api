import { z } from "zod";
import { _ } from "~/library/handler";
import { ScheduleServiceCreate } from "./schedule.service";
import { ScheduleZodSchema } from "./schedule.types";

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
