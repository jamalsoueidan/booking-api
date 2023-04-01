import { createUser } from "../user.jest";
import {
  UserServiceCreate,
  UserServiceFindAll,
  UserServiceFindByIdAndUpdate,
  UserServiceGetById,
  UserServiceGetUserIdsbyGroup,
} from "../user.service";
import { User, UserRole, UserUpdateBody } from "../user.types";

require("../../../library/jest/mongoose/mongodb.jest");

const user: Omit<User, "_id"> = {
  active: true,
  address: "asdpkads 12",
  avatar: "https://test.dk/test.png",
  email: "test@test.com",
  fullname: "jamasdeidan",
  group: "a",
  language: "da",
  password: "12345678",
  phone: "+4531317428",
  position: "1",
  postal: 8000,
  role: UserRole.admin,
  timeZone: "Europe/Copenhagen",
};

describe("UserService test", () => {
  it("Should create a user", async () => {
    const createSetting = await UserServiceCreate(user);
    expect(createSetting).not.toBeNull();
  });

  it("Should get list of user", async () => {
    await UserServiceCreate(user);
    const allUser = await UserServiceFindAll();
    expect(allUser.length).toEqual(1);
  });

  it("Should update user", async () => {
    await UserServiceCreate(user);
    const allUser = await UserServiceFindAll();
    const oneUser = allUser.pop();

    const body: UserUpdateBody = {
      fullname: "jamal soueidan",
      email: "asd@asd.dk",
      phone: "31317428",
      postal: 8220,
      position: "<string>",
      avatar: "<string>",
    };

    const updateUser = await UserServiceFindByIdAndUpdate(oneUser?._id, body);
    expect(updateUser?.fullname).toEqual(body.fullname);
  });

  it("Should get one user by id", async () => {
    await UserServiceCreate(user);
    const allUser = await UserServiceFindAll();
    const fromAllUser = allUser.pop();

    const oneUser = await UserServiceGetById({
      _id: fromAllUser?._id,
    });
    expect(oneUser?._id).toEqual(fromAllUser?._id);
  });

  it("Should return all user in the same group", async () => {
    const userGroupA = await createUser({
      group: "a",
      role: UserRole.user,
    });

    await createUser({ group: "a", role: UserRole.owner });
    await createUser({ group: "a", role: UserRole.admin });
    const userGroupB = await createUser({ group: "b" });

    let users = await UserServiceGetUserIdsbyGroup({
      group: userGroupA.group,
    });

    expect(users.length).toBe(3);

    users = await UserServiceGetUserIdsbyGroup({
      group: userGroupB.group,
    });

    expect(users.length).toBe(1);
  });
});
