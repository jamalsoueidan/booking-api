import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString } from "~/library/zod";
import { UserServiceTop } from "../../services/user/top";

export type UserControllerTopRequest = {
  query: z.infer<typeof UserControllerTopSchema>;
};

export const UserControllerTopSchema = z.object({
  limit: NumberOrString.optional(),
  page: NumberOrString.optional(),
});

export type UserControllerTopResponse = Awaited<
  ReturnType<typeof UserServiceTop>
>;

export const UserControllerTop = _(
  async ({ query }: UserControllerTopRequest) => {
    const validateData = UserControllerTopSchema.parse(query);
    return UserServiceTop(validateData);
  }
);
