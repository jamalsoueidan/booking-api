import { NotFoundError } from "~/library/handler";
import { UserModel } from "../user.model";
import { User } from "../user.types";

export type UserServiceGetProps = Pick<User, "username">;

export const UserServiceGet = (props: UserServiceGetProps) => {
  return UserModel.findOne({ ...props, active: true }).orFail(
    new NotFoundError([
      {
        path: ["userId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};

export const UserServiceList = () => {
  return UserModel.find({ active: true })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();
};