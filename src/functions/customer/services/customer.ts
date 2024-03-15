import { ScheduleModel } from "~/functions/schedule";
import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type CustomerServiceCreateBody = Omit<
  User,
  "_id" | "active" | "isBusiness"
>;

export const CustomerServiceCreate = async (
  body: CustomerServiceCreateBody
) => {
  const user = new UserModel({ ...body, isBusiness: true, active: true });
  return user.save();
};

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

export type CustomerServiceIsBusiness = Pick<User, "customerId">;

export const CustomerServiceIsBusiness = async (
  filter: CustomerServiceIsBusiness
) => {
  const user = await UserModel.findOne(filter).lean();
  return { isBusiness: user ? user.isBusiness : false };
};

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

export const CustomerServiceStatus = async ({
  customerId,
}: {
  customerId: number;
}) => {
  const user = await UserModel.findOne({ customerId });
  if (user) {
    const schedule = await ScheduleModel.count({ customerId });
    const locations = await ScheduleModel.count({ customerId });
    const services = await ScheduleModel.count({
      customerId,
      "products.0": { $exists: true },
    });

    const aboutMe = user.aboutMe !== undefined;
    const shortDescription = user.shortDescription !== undefined;
    const professions = !!user.professions && user.professions.length > 0;

    return {
      profile: aboutMe && shortDescription && professions,
      locations: locations > 0,
      schedules: schedule > 0,
      services: services > 0,
      profileImage: user.images?.profile?.url !== undefined,
    };
  } else {
    return {
      profile: false,
      locations: false,
      schedules: false,
      services: false,
      profileImage: false,
    };
  }
};
