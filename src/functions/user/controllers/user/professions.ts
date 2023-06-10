import { _ } from "~/library/handler";

import { UserServiceProfessions } from "../../services/user";

export type UserControllerProfessionsResponse = Awaited<
  ReturnType<typeof UserServiceProfessions>
>;

export const UserControllerProfessions = _(() => {
  return UserServiceProfessions();
});
