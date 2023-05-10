import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { ScheduleProductServiceGet } from "~/functions/schedule/services/product";
import { _ } from "~/library/handler";

export type CustomerProductControllerGetRequest = {
  query: z.infer<typeof CustomerProductControllerGetQuerySchema>;
};

const CustomerProductControllerGetQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type CustomerProductControllerGetResponse = Awaited<
  ReturnType<typeof ScheduleProductServiceGet>
>;

export const CustomerProductControllerGet = _(
  ({ query }: CustomerProductControllerGetRequest) => {
    const validateQuery = CustomerProductControllerGetQuerySchema.parse(query);
    return ScheduleProductServiceGet(validateQuery);
  }
);
