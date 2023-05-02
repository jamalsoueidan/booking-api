import { z } from "zod";
import { _ } from "~/library/handler";
import { ScheduleServiceUpdate } from "../schedule.service";
import { ScheduleZodSchema } from "../schedule.types";

export type ScheduleControllerUpdateRequest = {
  query: z.infer<typeof ScheduleControllerUpdateQuerySchema>;
  body: z.infer<typeof ScheduleControllerUpdateBodySchema>;
};

const ScheduleControllerUpdateQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
  _id: true,
});

const ScheduleControllerUpdateBodySchema = ScheduleZodSchema.omit({
  _id: true,
  customerId: true,
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
