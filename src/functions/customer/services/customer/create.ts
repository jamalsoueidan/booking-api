import { User, UserModel } from "~/functions/user";

export type CustomerServiceCreateBody = Pick<
  User,
  | "customerId"
  | "fullname"
  | "username"
  | "professions"
  | "aboutMe"
  | "aboutMeHtml"
  | "shortDescription"
  | "gender"
  | "speaks"
>;

export const CustomerServiceCreate = async (
  body: CustomerServiceCreateBody
) => {
  const user = new UserModel({ ...body, isBusiness: true });
  return user.save();
};
