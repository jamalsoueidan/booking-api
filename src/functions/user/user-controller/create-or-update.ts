import { z } from "zod";
import { _ } from "~/library/handler";
import { UserServiceCreateOrUpdate } from "../user.service";
import { UserZodSchema } from "../user.types";

export type UserControllerCreateUserOrUpdateRequest = {
  query: UserControllerCreateUserOrUpdateQuery;
  body: UserControllerCreateUserOrUpdateBody;
};

export const UserControllerCreateUserOrUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type UserControllerCreateUserOrUpdateQuery = z.infer<
  typeof UserControllerCreateUserOrUpdateQuerySchema
>;

export const UserControllerCreateUserOrUpdateSchema = UserZodSchema.omit({
  _id: true,
  customerId: true,
});

export type UserControllerCreateUserOrUpdateBody = z.infer<
  typeof UserControllerCreateUserOrUpdateSchema
>;

export type UserControllerCreateUserOrUpdateResponse = Awaited<
  ReturnType<typeof UserServiceCreateOrUpdate>
>;

export const UserControllerCreateUserOrUpdate = _(
  ({ query, body }: UserControllerCreateUserOrUpdateRequest) => {
    const validateQuery =
      UserControllerCreateUserOrUpdateQuerySchema.parse(query);
    const validateBody = UserControllerCreateUserOrUpdateSchema.parse(body);
    return UserServiceCreateOrUpdate(validateQuery, validateBody);
  }
);
