import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { Professions } from "~/functions/user";

import { createUser } from "~/library/jest/helpers";
import {
  CustomerControllerUpdate,
  CustomerControllerUpdateRequest,
  CustomerControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../../orchestrations/customer/update", () => ({
  CustomerUpdateOrchestration: () => ({
    request: jest.fn(),
  }),
}));

describe("CustomerControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Should able to update user", async () => {
    const user = await createUser({ customerId: 123 });

    const updatedData = {
      aboutMe: "test test",
    };

    request = await createHttpRequest<CustomerControllerUpdateRequest>({
      query: {
        customerId: user.customerId,
      },
      body: {
        professions: [Professions.HAIR_STYLIST],
        specialties: ["fade"],
        fullname: "jamal",
      },
      context,
    });

    const res: HttpSuccessResponse<CustomerControllerUpdateResponse> =
      await CustomerControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamal");
    expect(res.jsonBody?.payload.specialties).toEqual(["fade"]);
  });
});
