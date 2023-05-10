import { z } from "zod";
import { _ } from "~/library/handler";

import { ScheduleProductZodSchema } from "~/functions/schedule";
import { UserZodSchema } from "~/functions/user";
import { CustomerProductAvailabilityServiceGet } from "../../services/availability";
import { CustomerProductsServiceListIds } from "../../services/product";

export type CustomerProductControllerAvailabilityRequest = {
  query: z.infer<typeof CustomerProductControllerAvailabilitySchema>;
};

export const CustomerProductControllerAvailabilitySchema = z.object({
  customerId: UserZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
  startDate: z.coerce.date(),
});

export type CustomerProductControllerAvailabilityResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceListIds>
>;

export const CustomerProductControllerAvailability = _(
  async ({ query }: CustomerProductControllerAvailabilityRequest) => {
    const validateData =
      CustomerProductControllerAvailabilitySchema.parse(query);
    return CustomerProductAvailabilityServiceGet(validateData);
  }
);
