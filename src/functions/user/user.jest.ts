import { faker } from "@faker-js/faker";
import { UserServiceCreate } from "./user.service";
import { User, UserRole } from "./user.types";

export const createUser = (props: Partial<User> = {}) =>
  UserServiceCreate({
    active: true,
    address: "asdiojdsajioadsoji",
    avatar: "http://",
    email: faker.internet.email(),
    fullname: faker.name.fullName(),
    group: "all",
    language: "da",
    password: "12345678",
    phone: "+4531317411",
    position: "2",
    postal: 8000,
    role: UserRole.user,
    timeZone: "Europe/Copenhagen",
    ...props,
  });
