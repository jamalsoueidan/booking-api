import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { PublicationsQuery } from "~/types/admin.generated";
import {
  PUBLICATIONS,
  PUBLISH_COLLECTION,
  publishCollection,
} from "./publish-collection";

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

  it("createCollection", async () => {
    const collectionId = "gid://shopify/Collection/625094558023";

    mockRequest.mockResolvedValueOnce({
      data: ensureType<PublicationsQuery>({
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
      }),
    });

    const mockPublications = await publishCollection({
      collectionId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(8);

    expect(mockRequest).toHaveBeenNthCalledWith(1, PUBLICATIONS);

    mockPublications.map((p, index) => {
      expect(mockRequest).toHaveBeenNthCalledWith(
        2 + index,
        PUBLISH_COLLECTION,
        {
          variables: {
            collectionId,
            publicationId: p.id,
          },
        }
      );
    });
  });
});
