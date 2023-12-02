import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { Professions } from "~/functions/user";

import { createUser } from "~/library/jest/helpers";
import {
  CustomerControllerUpsert,
  CustomerControllerUpsertRequest,
  CustomerControllerUpsertResponse,
} from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerUpsert", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Should able to update user", async () => {
    const user = await createUser({ customerId: 123 });

    request = await createHttpRequest<CustomerControllerUpsertRequest>({
      query: {
        customerId: user.customerId,
      },
      body: {
        professions: [Professions.HAIR_STYLIST],
        specialties: ["fade"],
        fullname: "jamal",
      },
    });

    const res: HttpSuccessResponse<CustomerControllerUpsertResponse> =
      await CustomerControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamal");
    expect(res.jsonBody?.payload.specialties).toEqual(["fade"]);
  });
});
