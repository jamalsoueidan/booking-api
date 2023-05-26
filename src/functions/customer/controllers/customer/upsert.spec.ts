import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { CustomerServiceUpsert } from "../../services";
import {
  CustomerControllerUpsert,
  CustomerControllerUpsertBody,
  CustomerControllerUpsertRequest,
  CustomerControllerUpsertResponse,
} from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerUpsert", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const query = { customerId: faker.datatype.number() };
  const body: CustomerControllerUpsertBody = {
    title: faker.name.jobTitle(),
    username: faker.internet.userName(),
    aboutMe: faker.lorem.paragraph(),
    speaks: [faker.random.locale()],
    images: {
      profile: {
        url: faker.internet.avatar(),
      },
    },
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    await CustomerServiceUpsert(query, {
      fullname: "asd",
      username: "asd",
    });

    request = await createHttpRequest<CustomerControllerUpsertRequest>({
      query,
      body,
    });

    const res: HttpSuccessResponse<CustomerControllerUpsertResponse> =
      await CustomerControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.title).toEqual(body.title);
  });

  it("Should able to update user", async () => {
    await CustomerServiceUpsert(query, {
      fullname: "asd",
      username: "asd",
      ...body,
    });

    request = await createHttpRequest<CustomerControllerUpsertRequest>({
      query,
      body: {
        title: "test",
      } as any,
    });

    const res: HttpSuccessResponse<CustomerControllerUpsertResponse> =
      await CustomerControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.title).toEqual("test");
  });
});