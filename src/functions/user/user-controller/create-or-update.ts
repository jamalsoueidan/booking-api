import { z } from "zod";
import { _ } from "~/library/handler";
import { UserServiceCreateOrUpdate } from "../user.service";
import { UserZodSchema } from "../user.types";

export type UserControllerCreateOrUpdateRequest = {
  query: UserControllerCreateOrUpdateQuery;
  body: UserControllerCreateOrUpdateBody;
};

export const UserControllerCreateOrUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type UserControllerCreateOrUpdateQuery = z.infer<
  typeof UserControllerCreateOrUpdateQuerySchema
>;

export const UserControllerCreateOrUpdateSchema = UserZodSchema.omit({
  _id: true,
  customerId: true,
});

export type UserControllerCreateOrUpdateBody = z.infer<
  typeof UserControllerCreateOrUpdateSchema
>;

export type UserControllerCreateOrUpdateResponse = Awaited<
  ReturnType<typeof UserServiceCreateOrUpdate>
>;

export const UserControllerCreateOrUpdate = _(
  ({ query, body }: UserControllerCreateOrUpdateRequest) => {
    const validateQuery = UserControllerCreateOrUpdateQuerySchema.parse(query);
    const validateBody = UserControllerCreateOrUpdateSchema.parse(body);
    return UserServiceCreateOrUpdate(validateQuery, validateBody);
  }
);
