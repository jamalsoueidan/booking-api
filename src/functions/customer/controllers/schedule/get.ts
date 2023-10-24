import { z } from "zod";

import { ScheduleZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";
import { CustomerScheduleServiceGet } from "../../services/schedule/get";

export type CustomerScheduleControllerGetRequest = {
  query: z.infer<typeof CustomerScheduleControllerGetSchema>;
};

const CustomerScheduleControllerGetSchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  customerId: ScheduleZodSchema.shape.customerId,
});

export type CustomerScheduleControllerGetResponse = Awaited<
  ReturnType<typeof CustomerScheduleServiceGet>
>;

export const CustomerScheduleControllerGet = _(
  ({ query }: CustomerScheduleControllerGetRequest) => {
    const validateQuery = CustomerScheduleControllerGetSchema.parse(query);
    return CustomerScheduleServiceGet(validateQuery);
  }
);
