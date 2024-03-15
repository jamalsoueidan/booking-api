import { z } from "zod";

import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";
import { CustomerLocationServiceList } from "../../services/location/list";

export type CustomerLocationControllerGetAllRequest = {
  query: z.infer<typeof CustomerLocationControllerGetAllQuerySchema>;
};

export const CustomerLocationControllerGetAllQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetAllResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceList>
>;

export const CustomerLocationControllerGetAll = _(
  ({ query }: CustomerLocationControllerGetAllRequest) => {
    const validateData =
      CustomerLocationControllerGetAllQuerySchema.parse(query);
    return CustomerLocationServiceList(validateData);
  }
);
