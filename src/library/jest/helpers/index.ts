import { faker } from "@faker-js/faker";
import { AuthRole, AuthServiceCreate } from "~/functions/auth";
import { User, UserServiceCreate } from "~/functions/user";
import { jwtCreateToken } from "~/library/jwt";

export const getUserObject = (props: Partial<User> = {}) => ({
  active: true,
  address: "asdiojdsajioadsoji",
  avatar: faker.image.imageUrl(undefined, undefined, "jpg"),
  email: faker.internet.email(),
  fullname: faker.name.fullName(),
  group: "all",
  language: "da",
  phone: faker.phone.number("########"),
  position: "2",
  postal: 8000,
  timeZone: "Europe/Copenhagen",
  ...props,
});

export const createUser = (props: Partial<User> = {}) =>
  UserServiceCreate(getUserObject(props));

export const login = async (role: AuthRole) => {
  const newUser = {
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "all",
    phone: "31317428",
  };

  const user = await createUser(newUser);
  const auth = await AuthServiceCreate({ ...newUser, role, userId: user._id });
  return jwtCreateToken(auth.toJSON());
};
