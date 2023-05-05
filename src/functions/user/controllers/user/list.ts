import { _ } from "~/library/handler";

import { UserServiceList } from "../../services/user";

export type UserControllerListRequest = {};

export type UserControllerListResponse = Awaited<
  ReturnType<typeof UserServiceList>
>;

export const UserControllerList = _(async () => {
  return UserServiceList();
});
