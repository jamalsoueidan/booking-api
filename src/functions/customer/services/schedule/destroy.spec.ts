import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { DestroyScheduleMetafieldMutation } from "~/types/admin.generated";
import { CustomerScheduleServiceDestroy } from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleServiceDestroy", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should delete an existing schedule", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<DestroyScheduleMetafieldMutation>({
        metafieldDelete: {
          deletedId: "gid://shopify/Metaobject/77850968391",
        },
      }),
    });

    const deleteResult = await CustomerScheduleServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(deleteResult.deletedCount).toEqual(1);
  });
});
