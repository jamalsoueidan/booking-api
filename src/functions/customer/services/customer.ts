import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerServiceUpsert = Pick<User, "customerId">;
export type CustomerServiceUpsertBody = Omit<User, "_id" | "customerId">;

export const CustomerServiceUpsert = async (
  filter: Pick<User, "customerId">,
  body: CustomerServiceUpsertBody
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
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );
};

export type CustomerServiceIsBusiness = Pick<User, "customerId">;

export const CustomerServiceIsBusiness = async (
  filter: CustomerServiceIsBusiness
) => {
  const user = await UserModel.findOne(filter).lean();
  return { exists: user ? true : false };
};

export type CustomerServiceGetPRops = Pick<User, "username">;

export const CustomerServiceGet = async (filter: CustomerServiceGetPRops) => {
  return await UserModel.findOne({ ...filter, active: true })
    .lean()
    .orFail(
      new NotFoundError([
        {
          path: ["customerId"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    );
};

export const CustomerServiceList = () => {
  return UserModel.find({ active: true })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();
};
