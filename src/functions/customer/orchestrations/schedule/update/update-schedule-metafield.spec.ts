import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  UpdateScheduleMetaobjectMutation,
  UpdateScheduleMetaobjectMutationVariables,
} from "~/types/admin.generated";

import {
  UPDATE_SCHEDULE_METAOBJECT,
  updateScheduleMetafield,
} from "./update-schedule-metafield";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateScheduleMetafield", async () => {
    const newSchedule = await createSchedule({
      metafieldId: "1",
      name: "ANOTHER CUSTOMER",
      customerId: 7,
      products: [],
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateScheduleMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                value: newSchedule.name,
                key: "name",
              },
              {
                value: JSON.stringify(newSchedule.slots),
                key: "slots",
              },
            ],
          },
        },
      }),
    });

    await updateScheduleMetafield({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, UPDATE_SCHEDULE_METAOBJECT, {
      variables: ensureType<UpdateScheduleMetaobjectMutationVariables>({
        id: newSchedule.metafieldId || "",
        fields: [
          {
            value: newSchedule.name,
            key: "name",
          },
          {
            value: JSON.stringify([
              {
                day: "monday",
                intervals: [
                  {
                    to: "16:00",
                    from: "08:00",
                  },
                ],
              },
            ]),
            key: "slots",
          },
        ],
      }),
    });
  });
});
