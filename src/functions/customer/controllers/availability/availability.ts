import { z } from "zod";
import { _ } from "~/library/handler";

import { ScheduleProductZodSchema } from "~/functions/schedule";
import { UserZodSchema } from "~/functions/user";
import { CustomerProductAvailabilityServiceGet } from "../../services/availability";
import { CustomerProductsServiceGet } from "../../services/product";

export type CustomerProductAvailabilityControllerGetRequest = {
  query: z.infer<typeof CustomerProductAvailabilityControllerGetSchema>;
};

export const CustomerProductAvailabilityControllerGetSchema = z.object({
  customerId: UserZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
  startDate: z.coerce.date(),
});

export type CustomerProductAvailabilityControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceGet>
>;

export const CustomerProductAvailabilityControllerGet = _(
  async ({ query }: CustomerProductAvailabilityControllerGetRequest) => {
    const validateData =
      CustomerProductAvailabilityControllerGetSchema.parse(query);
    return CustomerProductAvailabilityServiceGet(validateData);
  }
);
