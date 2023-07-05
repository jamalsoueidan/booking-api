import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";

import { CustomerAvailabilityServiceGet } from "../../services";
import { CustomerProductsServiceListIds } from "../../services/product";

export type CustomerAvailabilityControllerGetRequest = {
  query: z.infer<typeof CustomerAvailabilityControllerGetSchema>;
};

const commaSeparatedNumberArray = z
  .string()
  .transform((value) => value.split(",").map(Number));

export const CustomerAvailabilityControllerGetSchema = z.object({
  customerId: UserZodSchema.shape.customerId,
  productIds: commaSeparatedNumberArray,
  startDate: z.string(),
});

export type CustomerAvailabilityControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceListIds>
>;

export const CustomerAvailabilityControllerGet = _(
  async ({ query }: CustomerAvailabilityControllerGetRequest) => {
    const validateData = CustomerAvailabilityControllerGetSchema.parse(query);
    return CustomerAvailabilityServiceGet(validateData);
  }
);
