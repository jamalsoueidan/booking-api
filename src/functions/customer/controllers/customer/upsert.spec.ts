import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import {
  CustomerServiceUpsert,
  CustomerServiceUpsertBody,
} from "../../services";
import {
  CustomerControllerUpsert,
  CustomerControllerUpsertRequest,
  CustomerControllerUpsertResponse,
} from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerCreateOrUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const query = { customerId: faker.datatype.number() };
  const body: CustomerServiceUpsertBody = {
    title: faker.name.jobTitle(),
    username: faker.internet.userName(),
    fullname: faker.name.fullName(),
    aboutMe: faker.lorem.paragraph(),
    avatar: faker.internet.avatar(),
    speaks: [faker.random.locale()],
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    request = await createHttpRequest<CustomerControllerUpsertRequest>({
      query,
      body,
    });

    const res: HttpSuccessResponse<CustomerControllerUpsertResponse> =
      await CustomerControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(body.fullname);
  });

  it("Should able to update user", async () => {
    await CustomerServiceUpsert(query, body);

    request = await createHttpRequest<CustomerControllerUpsertRequest>({
      query,
      body: {
        ...body,
        fullname: "jamalsoueidan",
      },
    });

    const res: HttpSuccessResponse<CustomerControllerUpsertResponse> =
      await CustomerControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamalsoueidan");
  });
});
