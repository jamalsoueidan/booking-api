import { UserModel } from "~/functions/user";
import { getUserObject } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  CollectionCreateMutation,
  CreateUserMetaobjectMutation,
} from "~/types/admin.generated";
import {
  COLLECTION_CREATE,
  CREATE_USER_METAOBJECT,
  CustomerServiceCreate,
  PUBLICATIONS,
  PUBLISH_COLLECTION,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

const mockPublications = {
  publications: {
    nodes: [
      {
        id: "gid://shopify/Publication/100827824402",
      },
      {
        id: "gid://shopify/Publication/100833296658",
      },
      {
        id: "gid://shopify/Publication/109184483602",
      },
      {
        id: "gid://shopify/Publication/124387754258",
      },
      {
        id: "gid://shopify/Publication/131001155858",
      },
      {
        id: "gid://shopify/Publication/134703219015",
      },
      {
        id: "gid://shopify/Publication/175752184135",
      },
    ],
  },
};

const mockPublish = {
  publishable: {
    id: "gid://shopify/Collection/625094558023",
    handle: "testestest",
  },
};

describe("CustomerServiceCreate", () => {
  beforeAll(async () => {
    await UserModel.ensureIndexes();
    jest.clearAllMocks();
  });

  it("Should create a user", async () => {
    const userData = getUserObject();

    const collectionMetaobjectId = "gid://shopify/Collection/625094558023";
    const userMetaobjectId = "gid://shopify/Metaobject/77261930823";

    mockRequest
      .mockResolvedValueOnce({
        data: ensureType<CollectionCreateMutation>({
          collectionCreate: {
            collection: {
              id: collectionMetaobjectId,
              title: userData.username,
              descriptionHtml: "",
              handle: userData.username,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        data: ensureType<CreateUserMetaobjectMutation>({
          metaobjectCreate: {
            metaobject: {
              id: userMetaobjectId,
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
                  value: userData.aboutMe,
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
      })
      .mockResolvedValueOnce({
        data: mockPublications,
      })
      .mockResolvedValue({
        mockPublish,
      });

    const user = await CustomerServiceCreate(userData);

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(
      3 + mockPublications.publications.nodes.length
    );

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, COLLECTION_CREATE, {
      variables: {
        input: {
          handle: user.username,
          title: user.username,
          ruleSet: {
            appliedDisjunctively: false,
            rules: [
              {
                column: "TAG" as any,
                relation: "EQUALS" as any,
                condition: `user-${user.username}`,
              },
            ],
          },
        },
      },
    });

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      CREATE_USER_METAOBJECT,
      {
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
              value: user.aboutMe || "",
            },
            {
              key: "professions",
              value: JSON.stringify(user.professions || []),
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
      }
    );

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(3, PUBLICATIONS);

    mockPublications.publications.nodes.map((p, index) => {
      expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
        4 + index,
        PUBLISH_COLLECTION,
        {
          variables: {
            collectionId: collectionMetaobjectId,
            publicationId: p.id,
          },
        }
      );
    });

    expect(user).toMatchObject(userData);
    const getuser = await UserModel.findById(user._id);
    expect(getuser?.collectionMetaobjectId).toBe(collectionMetaobjectId);
    expect(getuser?.userMetaobjectId).toBe(
      "gid://shopify/Metaobject/77261930823"
    );
  });
});
