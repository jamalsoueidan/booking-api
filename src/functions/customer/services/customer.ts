import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerServiceCreateOrUpdate = Pick<User, "customerId">;
export type CustomerServiceCreateOrUpdateBody = Omit<
  User,
  "_id" | "customerId"
>;

export const CustomerServiceCreateOrUpdate = async (
  filter: Pick<User, "customerId">,
  body: CustomerServiceCreateOrUpdateBody
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
