import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";

import { _ } from "~/library/handler";
import { CustomerLocationServiceCreate } from "../../services/location/create";

export type CustomerLocationControllerCreateRequest = {
  query: z.infer<typeof CustomerLocationControllerCreateQuerySchema>;
  body: z.infer<typeof LocationZodSchema>;
};

export const CustomerLocationControllerCreateBodySchema =
  LocationZodSchema.omit({
    customerId: true,
  }).strip();

export const CustomerLocationControllerCreateQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceCreate>
>;

export const CustomerLocationControllerCreate = _(
  ({ query, body }: CustomerLocationControllerCreateRequest) => {
    const validateData =
      CustomerLocationControllerCreateQuerySchema.parse(query);

    const validateBody = CustomerLocationControllerCreateBodySchema.parse(body);

    return CustomerLocationServiceCreate({
      ...validateData,
      ...validateBody,
    });
  }
);
