import { faker } from "@faker-js/faker";
import { AuthModel, AuthRole } from "~/functions/auth";
import { User, UserServiceCreate } from "~/functions/user";
import { jwtCreateToken } from "~/library/jwt";

export const DEFAULT_GROUP = "all";

export const getUserObject = (props: Partial<User> = {}) => ({
  active: true,
  address: "asdiojdsajioadsoji",
  avatar: faker.image.imageUrl(undefined, undefined, "jpg"),
  email: faker.internet.email(),
  fullname: faker.name.fullName(),
  group: DEFAULT_GROUP,
  language: "da",
  phone: faker.phone.number("########"),
  position: "2",
  postal: 8000,
  timeZone: "Europe/Copenhagen",
  ...props,
});

export const createUser = (props: Partial<User> = {}) => {
  return UserServiceCreate(getUserObject(props));
};

export const login = async (role: AuthRole) => {
  const newUser = getUserObject({
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "all",
    phone: "31317428",
  });

  const user = await UserServiceCreate(newUser, role);
  const auth = await AuthModel.findOne({ userId: user._id });

  if (!auth) {
    return {};
  }

  return { token: jwtCreateToken(auth?.toJSON()), user, auth };
};
