import { z } from "zod";
import { _ } from "~/library/handler";
import { CustomerServiceGet } from "../../services";

export type CustomerControllerGetRequest = {
  query: z.infer<typeof CustomerServiceGetSchema>;
};

export const CustomerServiceGetSchema = z.object({
  identifier: z.any(),
});

export type CustomerControllerGetResponse = Awaited<
  ReturnType<typeof CustomerServiceGet>
>;

export const CustomerControllerGet = _(
  async ({ query }: CustomerControllerGetRequest) => {
    const validateData = CustomerServiceGetSchema.parse(query);
    return CustomerServiceGet({
      username: validateData.identifier,
      customerId: parseInt(validateData.identifier),
    });
  }
);
