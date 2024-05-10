import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerServiceGetProps = Pick<User, "customerId">;

export const CustomerServiceGet = async (filter: CustomerServiceGetProps) => {
  return UserModel.findOne(filter).orFail(
    new NotFoundError([
      {
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};
