import { NotFoundError } from "~/library/handler";
import { UserModel } from "../../user.model";
import { User } from "../../user.types";

export type UserServiceGetProps = Required<Pick<User, "username">>;

export const UserServiceGet = ({ username }: UserServiceGetProps) => {
  return UserModel.findOne({ username, isBusiness: true })
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["username"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};
