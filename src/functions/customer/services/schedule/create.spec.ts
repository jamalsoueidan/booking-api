import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  CreateScheduleMetaobjectMutation,
  CreateScheduleMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  CREATE_SCHEDULE_METAOBJECT,
  CustomerScheduleServiceCreate,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleServiceCreate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should create a new schedule", async () => {
    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateScheduleMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: "gid://shopify/Metaobject/77850968391",
            type: "schedule",
            fields: [
              {
                value: name,
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

    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
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

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.metafieldId).toEqual(
      "gid://shopify/Metaobject/77850968391"
    );
    expect(newSchedule.customerId).toEqual(customerId);
  });
});
