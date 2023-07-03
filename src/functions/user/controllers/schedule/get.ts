import { z } from "zod";
import { ScheduleZodSchema } from "~/functions/schedule";

import { LocationZodSchema } from "~/functions/location";
import { _ } from "~/library/handler";
import { UserScheduleServiceGet } from "../../services/schedule";

export type UserScheduleControllerGetRequest = {
  query: z.infer<typeof UserScheduleControllerGetQuerySchema>;
};

const UserScheduleControllerGetQuerySchema = z.object({
  scheduleId: ScheduleZodSchema.shape._id,
  username: z.string(),
  locationId: LocationZodSchema.shape._id,
});

export type UserScheduleControllerGetResponse = Awaited<
  ReturnType<typeof UserScheduleServiceGet>
>;

export const UserScheduleControllerGet = _(
  ({ query }: UserScheduleControllerGetRequest) => {
    const validateQuery = UserScheduleControllerGetQuerySchema.parse(query);
    return UserScheduleServiceGet(validateQuery);
  }
);
