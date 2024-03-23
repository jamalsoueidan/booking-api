import { NotFoundError } from "~/library/handler";
import { UserModel } from "../../user.model";

export const UserServiceFindCustomerOrFail = ({
  customerId,
}: {
  customerId: number;
}) => {
  return UserModel.findOne({
    customerId,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};
