import { z } from "zod";
import { _ } from "~/library/handler";
import { ScheduleServiceGet } from "../schedule.service";
import { ScheduleZodSchema } from "../schedule.types";

export type ScheduleControllerGetRequest = {
  query: z.infer<typeof ScheduleControllerGetQuerySchema>;
};

const ScheduleControllerGetQuerySchema = ScheduleZodSchema.pick({
  _id: true,
  customerId: true,
});

export type ScheduleControllerGetResponse = Awaited<
  ReturnType<typeof ScheduleServiceGet>
>;

export const ScheduleControllerGet = _(
  ({ query }: ScheduleControllerGetRequest) => {
    const validateQuery = ScheduleControllerGetQuerySchema.parse(query);
    return ScheduleServiceGet(validateQuery);
  }
);
