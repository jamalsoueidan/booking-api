import { NotFoundError } from "~/library/handler";
import { UserModel } from "./user.model";
import { User } from "./user.types";

export type UserServiceCreateOrUpdate = Pick<User, "customerId">;
export type UserServiceCreateOrUpdateBody = Omit<User, "_id" | "customerId">;

export const UserServiceCreateOrUpdate = async (
  filter: Pick<User, "customerId">,
  body: UserServiceCreateOrUpdateBody
) => {
  // Use `await` to get the user from the database
  const user = await UserModel.findOne(filter);

  if (!user) {
    // Create a new user
    const newUser = new UserModel({ ...body, customerId: filter.customerId });
    return newUser.save();
  }

  return UserModel.findOneAndUpdate(filter, body, {
    new: true,
  }).orFail(
    new NotFoundError([
      {
        path: ["userId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};

export type UserServiceGetProps = Pick<User, "customerId">;

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
