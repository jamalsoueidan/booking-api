import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { CustomerLocationCreateOrchestration } from "../../orchestrations/location/create";
import { CustomerLocationServiceCreate } from "../../services/location/create";

export type CustomerLocationControllerCreateRequest = {
  query: z.infer<typeof CustomerLocationControllerCreateQuerySchema>;
  body: z.infer<typeof LocationZodSchema>;
  context: InvocationContext;
};

export const CustomerLocationControllerCreateBodySchema =
  LocationZodSchema.omit({
    customerId: true,
    city: true,
    country: true,
  }).strip();

export const CustomerLocationControllerCreateQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceCreate>
>;

export const CustomerLocationControllerCreate = _(
  async ({ query, body, context }: CustomerLocationControllerCreateRequest) => {
    const validateData =
      CustomerLocationControllerCreateQuerySchema.parse(query);

    const validateBody = CustomerLocationControllerCreateBodySchema.parse(body);

    const location = await CustomerLocationServiceCreate({
      ...validateData,
      ...validateBody,
    });

    await CustomerLocationCreateOrchestration(
      { locationId: location._id },
      context
    );

    return location;
  }
);
