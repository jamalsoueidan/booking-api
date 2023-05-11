import { z } from "zod";
import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerProductServiceDestroy } from "../../services";

export type CustomerProductControllerDestroyRequest = {
  query: z.infer<typeof CustomerProductControllerDestroyQuerySchema>;
};

const CustomerProductControllerDestroyQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export type CustomerProductControllerDestroyResponse = Awaited<
  ReturnType<typeof CustomerProductServiceDestroy>
>;

export const CustomerProductControllerDestroy = _(
  ({ query }: CustomerProductControllerDestroyRequest) => {
    const validateQuery =
      CustomerProductControllerDestroyQuerySchema.parse(query);
    return CustomerProductServiceDestroy(validateQuery);
  }
);
