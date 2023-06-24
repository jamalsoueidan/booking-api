import { z } from "zod";
import { CustomerLocationServiceSetDefault } from "~/functions/customer/services/location";
import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";

export type CustomerLocationControllerSetDefaultRequest = {
  query: z.infer<typeof LocationServiceSetDefaultQuerySchema>;
};

export const LocationServiceSetDefaultQuerySchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerSetDefaultResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceSetDefault>
>;

export const CustomerLocationControllerSetDefault = _(
  ({ query }: CustomerLocationControllerSetDefaultRequest) => {
    const validateData = LocationServiceSetDefaultQuerySchema.parse(query);
    return CustomerLocationServiceSetDefault(validateData);
  }
);
