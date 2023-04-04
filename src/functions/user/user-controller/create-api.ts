import { AuthRole, AuthServiceCreate } from "~/functions/auth";
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

    const user = await UserServiceCreate(validateBody);
    // figure out how to move this out so user doesn't know anything about auth service
    await AuthServiceCreate({
      ...validateBody,
      userId: user._id,
      role: AuthRole.owner,
    });

    return user;
  }
);
