import { z } from "zod";
import { _ } from "~/library/handler";
import { ScheduleServiceDestroy } from "../schedule.service";
import { ScheduleZodSchema } from "../schedule.types";

export type ScheduleControllerDestroyRequest = {
  query: z.infer<typeof ScheduleControllerDestroyQuerySchema>;
};

const ScheduleControllerDestroyQuerySchema = ScheduleZodSchema.pick({
  customerId: true,
  _id: true,
});

export type ScheduleControllerDestroyResponse = Awaited<
  ReturnType<typeof ScheduleServiceDestroy>
>;

export const ScheduleControllerDestroy = _(
  ({ query }: ScheduleControllerDestroyRequest) => {
    const validateQuery = ScheduleControllerDestroyQuerySchema.parse(query);
    return ScheduleServiceDestroy(validateQuery);
  }
);
