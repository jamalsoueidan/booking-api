import { z } from "zod";
import { CustomerLocationServiceAdd } from "~/functions/customer/services/location";
import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";

export type CustomerLocationControllerAddRequest = {
  query: z.infer<typeof LocationServiceAddQuerySchema>;
};

export const LocationServiceAddQuerySchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerAddResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceAdd>
>;

export const CustomerLocationControllerAdd = _(
  ({ query }: CustomerLocationControllerAddRequest) => {
    const validateData = LocationServiceAddQuerySchema.parse(query);
    return CustomerLocationServiceAdd(validateData);
  }
);
