import { z } from "zod";
import { CustomerScheduleServiceGet } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";

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
