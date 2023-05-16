import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceGet } from "../../services";

export type CustomerControllerGetRequest = {
  query: z.infer<typeof CustomerServiceGetSchema>;
};

export const CustomerServiceGetSchema = UserZodSchema.pick({
  username: true,
});

export type CustomerControllerGetResponse = Awaited<
  ReturnType<typeof CustomerServiceGet>
>;

export const CustomerControllerGet = _(
  async ({ query }: CustomerControllerGetRequest) => {
    const validateData = CustomerServiceGetSchema.parse(query);
    return CustomerServiceGet(validateData);
  }
);
