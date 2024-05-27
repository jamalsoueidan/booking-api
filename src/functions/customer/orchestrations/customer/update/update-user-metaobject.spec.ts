import { getUserObject } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateUserMetaobjectMutation } from "~/types/admin.generated";
import {
  UPDATE_USER_METAOBJECT,
  updateUserMetaobject,
} from "./update-user-metaobject";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateUserMetaobject", async () => {
    const user = getUserObject();

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateUserMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                key: "about_me",
                value: user.aboutMeHtml,
              },
            ],
          },
        },
      }),
    });

    await updateUserMetaobject({ user });

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      UPDATE_USER_METAOBJECT,
      {
        variables: {
          id: user.userMetaobjectId || "",
          fields: [
            {
              key: "fullname",
              value: user.fullname,
            },
            {
              key: "short_description",
              value: user.shortDescription || "",
            },
            {
              key: "about_me",
              value: user.aboutMeHtml || "",
            },
            {
              key: "professions",
              value: JSON.stringify(user.professions || []),
            },
            {
              key: "social",
              value: JSON.stringify(user.social),
            },
            {
              key: "active",
              value: String(user.active),
            },
            {
              key: "theme",
              value: user.theme?.color || "pink",
            },
          ],
        },
      }
    );
  });
});
