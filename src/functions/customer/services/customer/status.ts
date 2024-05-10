import { LocationModel } from "~/functions/location";
import { ScheduleModel } from "~/functions/schedule";
import { UserModel } from "~/functions/user";

export const CustomerServiceStatus = async ({
  customerId,
}: {
  customerId: number;
}) => {
  const user = await UserModel.findOne({ customerId });
  if (user) {
    const schedule = await ScheduleModel.count({ customerId });
    const locations = await LocationModel.count({
      customerId,
      deletedAt: undefined,
    });
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
