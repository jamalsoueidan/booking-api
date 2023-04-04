import { faker } from "@faker-js/faker";
import { AuthRole, AuthServiceCreate } from "~/functions/auth";
import { User, UserServiceCreate } from "~/functions/user";
import { jwtCreateToken } from "~/library/jwt";

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
  const newUser = {
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "all",
    phone: "007",
  };

  const user = await createUser(newUser);
  const auth = await AuthServiceCreate({ ...newUser, role, userId: user._id });
  return jwtCreateToken(auth.toJSON());
};
