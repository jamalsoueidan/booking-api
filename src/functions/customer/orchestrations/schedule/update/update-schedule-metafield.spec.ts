import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  UpdateScheduleMetaobjectMutation,
  UpdateScheduleMetaobjectMutationVariables,
} from "~/types/admin.generated";

import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
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
    const location1 = await createLocation({
      customerId: 123,
      metafieldId: "asd",
    });

    const location2 = await createLocation({
      customerId: 123,
      metafieldId: "2",
    });

    const product1 = getProductObject({
      locations: [
        getDumbLocationObject({
          location: location1._id,
          metafieldId: location1.metafieldId,
        }),
        getDumbLocationObject({
          location: location2._id,
          metafieldId: location2.metafieldId,
        }),
      ],
    });

    const product2 = getProductObject({
      locations: [
        getDumbLocationObject({
          location: location1._id,
          metafieldId: location1.metafieldId,
        }),
      ],
    });

    const newSchedule = await createSchedule({
      metafieldId: "1",
      name: "ANOTHER CUSTOMER",
      customerId: 7,
      products: [product1, product2],
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
              {
                value: JSON.stringify([
                  location1.metafieldId,
                  location2.metafieldId,
                ]),
                key: "locations",
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
          {
            value: JSON.stringify([
              location1.metafieldId,
              location2.metafieldId,
            ]),
            key: "locations",
          },
        ],
      }),
    });
  });
});
