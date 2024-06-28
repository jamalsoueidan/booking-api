import { getUserObject } from "~/library/jest/helpers";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { CollectionCreateMutation } from "~/types/admin.generated";
import {
  COLLECTION_CREATE,
  createUserCollection,
} from "./create-user-collection";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

let mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerCreateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("createUserCollection", async () => {
    const user = getUserObject();

    const collectionMetaobjectId = "gid://shopify/Collection/625094558023";

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CollectionCreateMutation>({
        collectionCreate: {
          collection: {
            id: collectionMetaobjectId,
            title: user.username,
            descriptionHtml: "",
            handle: user.username,
          },
        },
      }),
    });

    await createUserCollection({ user });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, COLLECTION_CREATE, {
      variables: {
        input: {
          handle: user.username,
          title: `User > ${user.username}`,
          ruleSet: {
            appliedDisjunctively: false,
            rules: [
              {
                column: "TAG" as any,
                relation: "EQUALS" as any,
                condition: `user-${user.username}`,
              },
              /*{
                column: "TAG" as any,
                relation: "EQUALS" as any,
                condition: `treatments`,
              },*/
            ],
          },
        },
      },
    });
  });
});
