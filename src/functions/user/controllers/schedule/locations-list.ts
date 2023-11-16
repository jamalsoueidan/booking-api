import { z } from "zod";

import { _ } from "~/library/handler";
import { UserScheduleServiceLocationsList } from "../../services/schedule/locations-list";
import { UserServiceGet } from "../../services/user";

export type UserScheduleControllerLocationsListRequest = {
  query: z.infer<typeof UserScheduleControllerLocationsListQuerySchema>;
};

const UserScheduleControllerLocationsListQuerySchema = z.object({
  username: z.string(),
});

export type UserScheduleControllerListResponse = Awaited<
  ReturnType<typeof UserScheduleServiceLocationsList>
>;

export const UserScheduleControllerLocationsList = _(
  async ({ query }: UserScheduleControllerLocationsListRequest) => {
    const validateQuery =
      UserScheduleControllerLocationsListQuerySchema.parse(query);
    const { customerId } = await UserServiceGet(validateQuery);
    return UserScheduleServiceLocationsList({ customerId });
  }
);
