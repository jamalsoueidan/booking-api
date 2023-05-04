import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import {
  CustomerServiceCreateOrUpdate,
  CustomerServiceCreateOrUpdateBody,
} from "../../services";
import {
  CustomerControllerCreateOrUpdate,
  CustomerControllerCreateOrUpdateRequest,
  CustomerControllerCreateOrUpdateResponse,
} from "./create-or-update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerCreateOrUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const query = { customerId: faker.datatype.number() };
  const body: CustomerServiceCreateOrUpdateBody = {
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
    request = await createHttpRequest<CustomerControllerCreateOrUpdateRequest>({
      query,
      body,
    });

    const res: HttpSuccessResponse<CustomerControllerCreateOrUpdateResponse> =
      await CustomerControllerCreateOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(body.fullname);
  });

  it("Should able to update user", async () => {
    await CustomerServiceCreateOrUpdate(query, body);

    request = await createHttpRequest<CustomerControllerCreateOrUpdateRequest>({
      query,
      body: {
        ...body,
        fullname: "jamalsoueidan",
      },
    });

    const res: HttpSuccessResponse<CustomerControllerCreateOrUpdateResponse> =
      await CustomerControllerCreateOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamalsoueidan");
  });
});
