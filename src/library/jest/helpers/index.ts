import { faker } from "@faker-js/faker";
import { AuthServiceCreate } from "../../../functions/auth/auth.service";
import { AuthRole } from "../../../functions/auth/auth.types";
import { UserServiceCreate } from "../../../functions/user/user.service";
import { User, UserCreateBody } from "../../../functions/user/user.types";
import { jwtCreateToken } from "../../jwt";

export const createUser = (props: Partial<User> = {}) =>
  UserServiceCreate({
    active: true,
    address: "asdiojdsajioadsoji",
    avatar: "http://",
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "all",
    language: "da",
    phone: "+4531317411",
    position: "2",
    postal: 8000,
    timeZone: "Europe/Copenhagen",
    ...props,
  });

export const login = async (role: AuthRole) => {
  const newUser: UserCreateBody = {
    active: true,
    address: "asdiojdsajioadsoji",
    avatar: "http://",
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "test",
    language: "da",
    phone: "007",
    position: "2",
    postal: 8000,
    timeZone: "Europe/Copenhagen",
  };

  const user = await createUser(newUser);
  const auth = await AuthServiceCreate({ ...newUser, role, userId: user._id });
  return jwtCreateToken(auth.toJSON());
};
