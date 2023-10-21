import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceIsBusiness } from "../../services/customer";

export type CustomerControllerIsBusinessRequest = {
  query: z.infer<typeof CustomerControllerIsBusinessSchema>;
};

export const CustomerControllerIsBusinessSchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerIsBusinessResponse = Awaited<
  ReturnType<typeof CustomerServiceIsBusiness>
>;

export const CustomerControllerIsBusiness = _(
  async ({ query }: CustomerControllerIsBusinessRequest) => {
    const validateData = CustomerControllerIsBusinessSchema.parse(query);
    return CustomerServiceIsBusiness(validateData);
  }
);
