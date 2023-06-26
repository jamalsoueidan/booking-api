import { z } from "zod";
import { CustomerLocationServiceGetOne } from "~/functions/customer/services/location";
import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";

export type CustomerLocationControllerGetOneRequest = {
  query: z.infer<typeof LocationServiceGetOneQuerySchema>;
};

export const LocationServiceGetOneQuerySchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetOneResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGetOne>
>;

export const CustomerLocationControllerGetOne = _(
  ({ query }: CustomerLocationControllerGetOneRequest) => {
    const validateData = LocationServiceGetOneQuerySchema.parse(query);
    return CustomerLocationServiceGetOne(validateData);
  }
);
