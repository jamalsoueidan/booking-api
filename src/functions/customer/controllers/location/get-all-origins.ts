import { z } from "zod";
import { LocationZodSchema } from "~/functions/location";
import { _ } from "~/library/handler";
import { CustomerLocationServiceGetAllOrigins } from "../../services/location";

export type CustomerLocationControllerGetAllOriginsRequest = {
  query: z.infer<typeof CustomerLocationServiceQuerySchema>;
};

export const CustomerLocationServiceQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetAllOriginsResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGetAllOrigins>
>;

export const CustomerLocationControllerGetAllOrigins = _(
  ({ query }: CustomerLocationControllerGetAllOriginsRequest) => {
    const validateData = CustomerLocationServiceQuerySchema.parse(query);
    return CustomerLocationServiceGetAllOrigins(validateData);
  }
);
