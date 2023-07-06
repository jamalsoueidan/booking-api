import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";
import { LocationServiceCreate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerCreateRequest = {
  query: z.infer<typeof CustomerLocationControllerCreateQuerySchema>;
  body: z.infer<typeof LocationZodSchema>;
};

export const CustomerLocationControllerCreateBodySchema =
  LocationZodSchema.omit({
    customerId: true,
  }).strict();

export const CustomerLocationControllerCreateQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerCreateResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const CustomerLocationControllerCreate = _(
  ({ query, body }: CustomerLocationControllerCreateRequest) => {
    const validateData =
      CustomerLocationControllerCreateQuerySchema.parse(query);

    const validateBody = CustomerLocationControllerCreateBodySchema.parse(body);

    return LocationServiceCreate({
      ...validateData,
      ...validateBody,
    });
  }
);
