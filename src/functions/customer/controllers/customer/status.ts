import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceStatus } from "../../services/customer";

export type CustomerControllerStatusRequest = {
  query: z.infer<typeof CustomerServiceStatusSchema>;
};

export const CustomerServiceStatusSchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerStatusResponse = Awaited<
  ReturnType<typeof CustomerServiceStatus>
>;

export const CustomerControllerStatus = _(
  async ({ query }: CustomerControllerStatusRequest) => {
    const validateData = CustomerServiceStatusSchema.parse(query);
    return CustomerServiceStatus(validateData);
  }
);
