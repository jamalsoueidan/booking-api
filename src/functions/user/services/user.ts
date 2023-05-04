import { NotFoundError } from "~/library/handler";
import { UserModel } from "../user.model";
import { User } from "../user.types";

export type UserServiceGetProps = Pick<User, "username">;

export const UserServiceGet = (props: UserServiceGetProps) => {
  return UserModel.findOne(props).orFail(
    new NotFoundError([
      {
        path: ["userId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};
