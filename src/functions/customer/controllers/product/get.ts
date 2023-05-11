import { z } from "zod";
import { CustomerProductServiceGet } from "~/functions/customer/services";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";

export type CustomerProductControllerGetRequest = {
  query: z.infer<typeof CustomerProductControllerGetQuerySchema>;
};

const CustomerProductControllerGetQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type CustomerProductControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductServiceGet>
>;

export const CustomerProductControllerGet = _(
  ({ query }: CustomerProductControllerGetRequest) => {
    const validateQuery = CustomerProductControllerGetQuerySchema.parse(query);
    return CustomerProductServiceGet(validateQuery);
  }
);
