import { UserModel } from "~/functions/user";
import { getUserObject } from "~/library/jest/helpers";
import { shopifyAdmin } from "~/library/shopify";
import {
  COLLECTION_CREATE,
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

const mockCollection = {
  collectionCreate: {
    collection: {
      id: "gid://shopify/Collection/625094558023",
      title: "testestest",
      descriptionHtml: "",
      handle: "testestest",
      sortOrder: "BEST_SELLING",
      ruleSet: {
        appliedDisjunctively: false,
        rules: [
          {
            column: "TAG",
            relation: "EQUALS",
            condition: "testest",
          },
        ],
      },
    },
  },
};

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
  const userData = getUserObject();

  beforeAll(async () => {
    await UserModel.ensureIndexes();
    jest.clearAllMocks();
  });

  it("Should create a user", async () => {
    mockRequest
      .mockResolvedValueOnce({
        data: mockCollection,
      })
      .mockResolvedValueOnce({
        data: mockPublications,
      })
      .mockResolvedValue({
        mockPublish,
      });

    const newUser = await CustomerServiceCreate(userData);

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(
      2 + mockPublications.publications.nodes.length
    );

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, COLLECTION_CREATE, {
      variables: {
        input: {
          handle: newUser.username,
          title: newUser.username,
          ruleSet: {
            appliedDisjunctively: false,
            rules: [
              {
                column: "TAG" as any,
                relation: "EQUALS" as any,
                condition: `user-${newUser.username}`,
              },
            ],
          },
        },
      },
    });

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(2, PUBLICATIONS);

    mockPublications.publications.nodes.map((p, index) => {
      expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
        3 + index,
        PUBLISH_COLLECTION,
        {
          variables: {
            collectionId: mockCollection.collectionCreate.collection.id,
            publicationId: p.id,
          },
        }
      );
    });

    expect(newUser).toMatchObject(userData);
    const getuser = await UserModel.findById(newUser._id);
    expect(getuser?.collectionId).toBe(
      mockCollection.collectionCreate.collection.handle
    );
  });

  it("Should throw error user with the same username", async () => {
    mockRequest
      .mockResolvedValueOnce({
        data: mockCollection,
      })
      .mockResolvedValueOnce({
        data: mockPublications,
      })
      .mockResolvedValue({
        mockPublish,
      });

    await CustomerServiceCreate({
      ...getUserObject(),
      username: "123123",
    });

    await expect(
      CustomerServiceCreate({
        ...getUserObject(),
        username: "123123",
      })
    ).rejects.toThrow(/E11000 duplicate key error/);
  });
});
