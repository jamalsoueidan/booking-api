import { User, UserModel } from "~/functions/user";

export type CustomerServiceIsBusiness = Pick<User, "customerId">;

export const CustomerServiceIsBusiness = async (
  filter: CustomerServiceIsBusiness
) => {
  const user = await UserModel.findOne(filter).lean();
  return { isBusiness: user ? user.isBusiness : false };
};
