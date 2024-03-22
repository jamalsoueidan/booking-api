import { _ } from "~/library/handler";
import { UserServiceProfessions } from "../../services/user/professions";

export type UserControllerProfessionsResponse = Awaited<
  ReturnType<typeof UserServiceProfessions>
>;

export const UserControllerProfessions = _(() => {
  return UserServiceProfessions();
});
