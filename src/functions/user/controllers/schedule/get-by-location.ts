import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule";

import { _ } from "~/library/handler";
import { UserScheduleServiceGetByLocation } from "../../services/schedule/get-by-location";

export type UserScheduleControllerGetByLocationRequest = {
  query: z.infer<typeof UserScheduleControllerGetByLocationQuerySchema>;
};

const UserScheduleControllerGetByLocationQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  username: z.string(),
  locationId: z.string(),
});

export type UserScheduleControllerGetByLocationResponse = Awaited<
  ReturnType<typeof UserScheduleServiceGetByLocation>
>;

export const UserScheduleControllerGetByLocation = _(
  ({ query }: UserScheduleControllerGetByLocationRequest) => {
    const validateQuery =
      UserScheduleControllerGetByLocationQuerySchema.parse(query);
    return UserScheduleServiceGetByLocation(validateQuery);
  }
);
