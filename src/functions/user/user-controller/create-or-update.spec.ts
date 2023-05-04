import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  UserServiceCreateOrUpdate,
  UserServiceCreateOrUpdateBody,
} from "../user.service";
import {
  UserControllerCreateUserOrUpdate,
  UserControllerCreateUserOrUpdateRequest,
  UserControllerCreateUserOrUpdateResponse,
} from "./create-or-update";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerCreateOrUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const query = { customerId: faker.datatype.number() };
  const body: UserServiceCreateOrUpdateBody = {
    title: faker.name.jobTitle(),
    username: faker.internet.userName(),
    fullname: faker.name.fullName(),
    social_urls: {
      instagram: faker.internet.url(),
      youtube: faker.internet.url(),
      twitter: faker.internet.url(),
    },
    description: faker.lorem.paragraph(),
    active: true,
    avatar: faker.internet.avatar(),
    speaks: [faker.random.locale()],
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    request = await createHttpRequest<UserControllerCreateUserOrUpdateRequest>({
      query,
      body,
    });

    const res: HttpSuccessResponse<UserControllerCreateUserOrUpdateResponse> =
      await UserControllerCreateUserOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(body.fullname);
  });

  it("Should able to update user", async () => {
    await UserServiceCreateOrUpdate(query, body);

    request = await createHttpRequest<UserControllerCreateUserOrUpdateRequest>({
      query,
      body: {
        ...body,
        fullname: "jamalsoueidan",
      },
    });

    const res: HttpSuccessResponse<UserControllerCreateUserOrUpdateResponse> =
      await UserControllerCreateUserOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamalsoueidan");
  });
});
