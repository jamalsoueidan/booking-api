import { UserModel } from "../../user.model";
import { User } from "../../user.types";

export type UserServiceUsernameTakenProps = Required<Pick<User, "username">>;

export const UserServiceUsernameTaken = async ({
  username,
}: UserServiceUsernameTakenProps) => {
  const usernameTaken = await UserModel.findOne({ username }).lean();
  return { usernameTaken: !!usernameTaken };
};
