import { z } from "zod";
import { _ } from "~/library/handler";

import { UserScheduleServiceLocationsList } from "../../services/schedule";
import { UserServiceGet } from "../../services/user";
import { UserZodSchema } from "../../user.types";

export type UserControllerGetRequest = {
  query: z.infer<typeof UserServiceGetSchema>;
};

export const UserServiceGetSchema = UserZodSchema.pick({
  username: true,
});

export type UserControllerGetResponse = Awaited<
  ReturnType<typeof UserServiceGet>
> &
  Awaited<ReturnType<typeof UserScheduleServiceLocationsList>>;

export const UserControllerGet = _(
  async ({ query }: UserControllerGetRequest) => {
    const validateData = UserServiceGetSchema.parse(query);
    const user = await UserServiceGet(validateData);
    const schedules = await UserScheduleServiceLocationsList(validateData);
    return {
      ...user,
      schedules,
    };
  }
);
