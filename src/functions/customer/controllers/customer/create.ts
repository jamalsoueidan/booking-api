import { HttpRequest, InvocationContext } from "@azure/functions";
import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerCreateOrchestration } from "../../orchestrations/customer/create";
import { CustomerServiceCreate } from "../../services/customer/create";

export type CustomerControllerCreateRequest = {
  body: CustomerControllerCreteBody;
  context: InvocationContext;
  request: HttpRequest;
};

export const CustomerControllerCreateSchema = UserZodSchema.pick({
  customerId: true,
  fullname: true,
  username: true,
  gender: true,
  speaks: true,
}).strip();

export type CustomerControllerCreteBody = z.infer<
  typeof CustomerControllerCreateSchema
>;

export type CustomerControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerServiceCreate>
>;

export const CustomerControllerCreate = _(
  async ({ body, context }: CustomerControllerCreateRequest) => {
    const validateBody = CustomerControllerCreateSchema.parse(body);
    const user = await CustomerServiceCreate(validateBody);

    await CustomerCreateOrchestration(user, context);

    return user;
  }
);
