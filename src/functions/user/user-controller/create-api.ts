import { AuthRole } from "~/functions/auth";
import { _ } from "~/library/handler";
import { UserServiceCreate } from "../user.service";
import {
  UserControllerCreateUserRequest,
  UserControllerCreateUserSchema,
} from "./create";

export type UserControllerCreateUserApiRequest =
  UserControllerCreateUserRequest;

export const UserControllerCreateUserApi = _(
  async ({ body }: UserControllerCreateUserApiRequest) => {
    const validateBody = UserControllerCreateUserSchema.parse(body);
    return UserServiceCreate(validateBody, AuthRole.owner);
  }
);
