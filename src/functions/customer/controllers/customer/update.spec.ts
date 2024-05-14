import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { Professions } from "~/functions/user";

import { createUser } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateUserMetaobjectMutation } from "~/types/admin.generated";
import {
  CustomerControllerUpdate,
  CustomerControllerUpdateRequest,
  CustomerControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

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

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateUserMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                key: "about_me",
                value: updatedData.aboutMe,
              },
            ],
          },
        },
      }),
    });

    request = await createHttpRequest<CustomerControllerUpdateRequest>({
      query: {
        customerId: user.customerId,
      },
      body: {
        professions: [Professions.HAIR_STYLIST],
        specialties: ["fade"],
        fullname: "jamal",
      },
    });

    const res: HttpSuccessResponse<CustomerControllerUpdateResponse> =
      await CustomerControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual("jamal");
    expect(res.jsonBody?.payload.specialties).toEqual(["fade"]);
  });
});
