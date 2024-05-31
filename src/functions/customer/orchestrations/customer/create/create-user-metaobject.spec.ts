import { getUserObject } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { CreateUserMetaobjectMutation } from "~/types/admin.generated";
import {
  CREATE_USER_METAOBJECT,
  createUserMetaobject,
} from "./create-user-metaobject";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerCreateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("createUserMetaobject", async () => {
    const userData = getUserObject({
      userMetaobjectId: "ok",
      specialties: [],
    });

    const collectionMetaobjectId = "gid://shopify/Collection/625094558023";

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateUserMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: userData.userMetaobjectId!,
            type: "user",
            fields: [
              {
                key: "fullname",
                value: userData.fullname,
              },
              {
                key: "username",
                value: userData.username,
              },
              {
                key: "short_description",
                value: userData.shortDescription,
              },
              {
                key: "about_me",
                value: userData.aboutMeHtml,
              },
              {
                key: "specialties",
                value: JSON.stringify(userData.specialties),
              },
              {
                key: "professions",
                value: JSON.stringify(userData.professions),
              },
              {
                key: "collection",
                value: collectionMetaobjectId,
              },
              {
                key: "theme",
                value: "pink",
              },
            ],
          },
          userErrors: [],
        },
      }),
    });

    await createUserMetaobject({
      user: userData,
      collectionId: "gid://shopify/Collection/625094558023",
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, CREATE_USER_METAOBJECT, {
      variables: {
        handle: userData.username,
        fields: [
          {
            key: "username",
            value: userData.username,
          },
          {
            key: "fullname",
            value: userData.fullname,
          },
          {
            key: "short_description",
            value: userData.shortDescription || "",
          },
          {
            key: "about_me",
            value: userData.aboutMeHtml || "",
          },
          {
            key: "specialties",
            value: JSON.stringify(userData.specialties),
          },
          {
            key: "professions",
            value: JSON.stringify(userData.professions || []),
          },
          {
            key: "collection",
            value: collectionMetaobjectId,
          },
          {
            key: "theme",
            value: "pink",
          },
          {
            key: "active",
            value: "False",
          },
        ],
      },
    });
  });
});
