import { z } from "zod";

import { ScheduleZodSchema } from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerScheduleServiceDestroy } from "../../services/schedule/destroy";

export type CustomerScheduleControllerDestroyRequest = {
  query: z.infer<typeof CustomerScheduleControllerDestroySchema>;
};

const CustomerScheduleControllerDestroySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

export type CustomerScheduleControllerDestroyResponse = Awaited<
  ReturnType<typeof CustomerScheduleServiceDestroy>
>;

export const CustomerScheduleControllerDestroy = _(
  ({ query }: CustomerScheduleControllerDestroyRequest) => {
    const validateQuery = CustomerScheduleControllerDestroySchema.parse(query);
    return CustomerScheduleServiceDestroy(validateQuery);
  }
);
