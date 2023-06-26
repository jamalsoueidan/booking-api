import { z } from "zod";
import { CustomerLocationServiceGetAll } from "~/functions/customer/services/location";
import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";

export type CustomerLocationControllerGetAllRequest = {
  query: z.infer<typeof LocationServiceGetAllQuerySchema>;
};

export const LocationServiceGetAllQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetAllResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGetAll>
>;

export const CustomerLocationControllerGetAll = _(
  ({ query }: CustomerLocationControllerGetAllRequest) => {
    const validateData = LocationServiceGetAllQuerySchema.parse(query);
    return CustomerLocationServiceGetAll(validateData);
  }
);
