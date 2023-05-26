import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import {
  CustomerControllerUpdate,
  CustomerControllerUpdateBody,
  CustomerControllerUpdateRequest,
  CustomerControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const query = { customerId: faker.datatype.number() };
  const body: CustomerControllerUpdateBody = {
    title: faker.name.jobTitle(),
    fullname: "test",
    username: faker.internet.userName(),
    aboutMe: faker.lorem.paragraph(),
    speaks: [faker.random.locale()],
    images: {
      profile: faker.internet.avatar(),
    },
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    request = await createHttpRequest<CustomerControllerUpdateRequest>({
      query,
      body,
    });

    const res: HttpSuccessResponse<CustomerControllerUpdateResponse> =
      await CustomerControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(body.fullname);
  });

  it("Should able to update user", async () => {
    request = await createHttpRequest<CustomerControllerUpdateRequest>({
      query,
      body: {
        phone: "004531317428",
      } as any,
    });

    const res: HttpSuccessResponse<CustomerControllerUpdateResponse> =
      await CustomerControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.phone).toEqual("004531317428");
  });
});
