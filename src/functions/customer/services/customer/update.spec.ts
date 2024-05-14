import { UserModel } from "~/functions/user";
import { createUser, getUserObject } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateUserMetaobjectMutation } from "~/types/admin.generated";
import { CustomerServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerService", () => {
  const userData = getUserObject();

  beforeAll(async () => UserModel.ensureIndexes());

  it("Should update a user by customerId", async () => {
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

    const updatedUser = await CustomerServiceUpdate(
      { customerId: user.customerId },
      updatedData
    );

    expect(updatedUser.aboutMe).toEqual(updatedData.aboutMe);
  });
});
