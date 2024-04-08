import { NotFoundError } from "~/library/handler";
import { UserModel } from "../../user.model";
import { User } from "../../user.types";

export type UserServiceGetCustomerIdProps = Required<Pick<User, "username">>;

export const UserServiceGetCustomerId = ({
  username,
}: UserServiceGetCustomerIdProps) => {
  return UserModel.findOne({ username, isBusiness: true }, { customerId: 1 })
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
