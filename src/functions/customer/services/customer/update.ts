import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerServiceUpdate = Pick<User, "customerId">;
export type CustomerServiceUpdateBody = Partial<
  Pick<
    User,
    | "fullname"
    | "phone"
    | "email"
    | "yearsExperience"
    | "gender"
    | "professions"
    | "specialties"
    | "speaks"
    | "aboutMe"
    | "shortDescription"
    | "social"
  >
>;

export const CustomerServiceUpdate = async (
  filter: Pick<User, "customerId">,
  body: CustomerServiceUpdateBody
) => {
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
