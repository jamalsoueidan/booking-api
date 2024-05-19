import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceCreate } from "../../services/customer/create";

export type CustomerControllerCreateRequest = {
  body: CustomerControllerCreteBody;
};

export const CustomerControllerCreateSchema = UserZodSchema.pick({
  customerId: true,
  fullname: true,
  username: true,
  professions: true,
  aboutMe: true,
  aboutMeHtml: true,
  shortDescription: true,
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
  ({ body }: CustomerControllerCreateRequest) => {
    const validateBody = CustomerControllerCreateSchema.parse(body);
    return CustomerServiceCreate(validateBody);
  }
);
