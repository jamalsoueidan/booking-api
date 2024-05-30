import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  UpdateScheduleLocationsFieldMutation,
  UpdateScheduleLocationsFieldMutationVariables,
} from "~/types/admin.generated";

import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import {
  UPDATE_SCHEDULE_LOCATIONS_FIELD,
  updateScheduleLocationsField,
} from "./update-schedule-locations-field";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerProductUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateScheduleLocationsField", async () => {
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
      data: ensureType<UpdateScheduleLocationsFieldMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
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

    await updateScheduleLocationsField({
      productId: product1.productId,
      customerId: newSchedule.customerId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      UPDATE_SCHEDULE_LOCATIONS_FIELD,
      {
        variables: ensureType<UpdateScheduleLocationsFieldMutationVariables>({
          id: newSchedule.metafieldId || "",
          fields: [
            {
              value: JSON.stringify([
                location1.metafieldId,
                location2.metafieldId,
              ]),
              key: "locations",
            },
          ],
        }),
      }
    );
  });
});
