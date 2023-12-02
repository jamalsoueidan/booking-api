import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceUpdate } from "../../services/customer";

export type CustomerControllerUpdateRequest = {
  query: CustomerControllerUpdateQuery;
  body: CustomerControllerUpdateBody;
};

export const CustomerControllerUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerUpdateQuery = z.infer<
  typeof CustomerControllerUpdateQuerySchema
>;

export const CustomerControllerUpdateSchema = UserZodSchema.pick({
  fullname: true,
  email: true,
  phone: true,
  yearsExperience: true,
  gender: true,
  professions: true,
  specialties: true,
  speaks: true,
  aboutMe: true,
  shortDescription: true,
  social: true,
})
  .partial()
  .strip();

export type CustomerControllerUpdateBody = z.infer<
  typeof CustomerControllerUpdateSchema
>;

export type CustomerControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerServiceUpdate>
>;

export const CustomerControllerUpdate = _(
  ({ query, body }: CustomerControllerUpdateRequest) => {
    const validateQuery = CustomerControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerControllerUpdateSchema.parse(body);
    return CustomerServiceUpdate(validateQuery, validateBody);
  }
);
