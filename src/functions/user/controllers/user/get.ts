import { z } from "zod";
import { _ } from "~/library/handler";

import { UserScheduleServiceLocationsList } from "../../services/schedule";
import { UserServiceGet } from "../../services/user";

export type UserControllerGetRequest = {
  query: z.infer<typeof UserServiceGetSchema>;
};

export const UserServiceGetSchema = z.object({
  username: z.string(),
});

export type UserControllerGetResponse = Awaited<
  ReturnType<typeof UserServiceGet>
> &
  Awaited<ReturnType<typeof UserScheduleServiceLocationsList>>;

// get schedule with products only belongs to specific locationId
export const UserControllerGet = _(
  async ({ query }: UserControllerGetRequest) => {
    const validateData = UserServiceGetSchema.parse(query);
    return UserServiceGet(validateData);
  }
);
