import { z } from "zod";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import { ScheduleZodSchema } from "~/functions/schedule";
import { _ } from "~/library/handler";

export type CustomerScheduleControllerCreateRequest = {
  query: z.infer<typeof CustomerScheduleControllerCreateQuerySchema>;
  body: z.infer<typeof CustomerScheduleControllerCreateBodySchema>;
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
  ({ query, body }: CustomerScheduleControllerCreateRequest) => {
    const validateQuery =
      CustomerScheduleControllerCreateQuerySchema.parse(query);
    const validateBody = CustomerScheduleControllerCreateBodySchema.parse(body);
    return CustomerScheduleServiceCreate({ ...validateQuery, ...validateBody });
  }
);
