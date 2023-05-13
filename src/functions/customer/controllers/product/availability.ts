import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";

import { CustomerProductAvailabilityService } from "../../services";
import { CustomerProductsServiceListIds } from "../../services/product";

export type CustomerProductControllerAvailabilityRequest = {
  query: z.infer<typeof CustomerProductControllerAvailabilitySchema>;
};

const commaSeparatedNumberArray = z
  .string()
  .transform((value) => value.split(",").map(Number));

export const CustomerProductControllerAvailabilitySchema = z.object({
  customerId: UserZodSchema.shape.customerId,
  productIds: commaSeparatedNumberArray,
  startDate: z.string(),
});

export type CustomerProductControllerAvailabilityResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceListIds>
>;

export const CustomerProductControllerAvailability = _(
  async ({ query }: CustomerProductControllerAvailabilityRequest) => {
    const validateData =
      CustomerProductControllerAvailabilitySchema.parse(query);
    return CustomerProductAvailabilityService(validateData);
  }
);
