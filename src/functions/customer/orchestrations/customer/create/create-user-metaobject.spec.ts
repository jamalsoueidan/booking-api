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
    const user = getUserObject({
      userMetaobjectId: "ok",
      specialties: [],
    });

    const collectionMetaobjectId = "gid://shopify/Collection/625094558023";

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateUserMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: user.userMetaobjectId!,
            type: "user",
            fields: [
              {
                key: "fullname",
                value: user.fullname,
              },
              {
                key: "username",
                value: user.username,
              },
              {
                key: "short_description",
                value: user.shortDescription,
              },
              {
                key: "about_me",
                value: user.aboutMeHtml,
              },
              {
                key: "specialties",
                value: JSON.stringify(user.specialties),
              },
              {
                key: "professions",
                value: JSON.stringify(user.professions),
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
      user: user,
      collectionId: "gid://shopify/Collection/625094558023",
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, CREATE_USER_METAOBJECT, {
      variables: {
        handle: user.username,
        fields: [
          {
            key: "username",
            value: user.username,
          },
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
            key: "specialties",
            value: JSON.stringify({ specialties: user.specialties || [] }),
          },
          {
            key: "professions",
            value: JSON.stringify({ professions: user.professions || [] }),
          },
          {
            key: "speaks",
            value: JSON.stringify({ speaks: user.speaks || [] }),
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
