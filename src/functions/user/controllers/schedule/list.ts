import { z } from "zod";

import { _ } from "~/library/handler";
import { UserScheduleServiceLocationsList } from "../../services/schedule";
import { UserServiceGet } from "../../services/user";

export type UserScheduleControllerListRequest = {
  query: z.infer<typeof UserScheduleControllerListQuerySchema>;
};

const UserScheduleControllerListQuerySchema = z.object({
  username: z.string(),
});

export type UserScheduleControllerListResponse = Awaited<
  ReturnType<typeof UserScheduleServiceLocationsList>
>;

export const UserScheduleControllerList = _(
  async ({ query }: UserScheduleControllerListRequest) => {
    const validateQuery = UserScheduleControllerListQuerySchema.parse(query);

    const { customerId } = await UserServiceGet(validateQuery);

    return UserScheduleServiceLocationsList({ customerId });
  }
);
