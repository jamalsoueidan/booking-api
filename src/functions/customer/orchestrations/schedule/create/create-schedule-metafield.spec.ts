import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  CreateScheduleMetaobjectMutation,
  CreateScheduleMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  CREATE_SCHEDULE_METAOBJECT,
  createScheduleMetafield,
} from "./create-schedule-metafield";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleCreateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("createScheduleMetafield", async () => {
    const newSchedule = await createSchedule({
      name: "test",
      customerId: 12,
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateScheduleMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: "gid://shopify/Metaobject/77850968391",
            type: "schedule",
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
          },
        },
      }),
    });

    await createScheduleMetafield({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, CREATE_SCHEDULE_METAOBJECT, {
      variables: ensureType<CreateScheduleMetaobjectMutationVariables>({
        handle: newSchedule._id,
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
