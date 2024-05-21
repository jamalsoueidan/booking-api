import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  UpdateScheduleMetaobjectMutation,
  UpdateScheduleMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  CustomerScheduleServiceUpdate,
  UPDATE_SCHEDULE_METAOBJECT,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerScheduleServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should update schedule", async () => {
    const newSchedule = new ScheduleModel({
      name,
      customerId,
      metafieldId: "gid://shopify/Metaobject/77850968391",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "08:00",
              to: "16:00",
            },
          ],
        },
      ],
    });
    await newSchedule.save();

    const updatedScheduleName = "Updated Test Schedule";

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateScheduleMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
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

    const updatedSchedule = await CustomerScheduleServiceUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
      },
      {
        name: updatedScheduleName,
      }
    );

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      UPDATE_SCHEDULE_METAOBJECT,
      {
        variables: ensureType<UpdateScheduleMetaobjectMutationVariables>({
          id: newSchedule.metafieldId || "",
          fields: [
            {
              value: updatedScheduleName,
              key: "name",
            },
          ],
        }),
      }
    );

    expect(updatedSchedule).toMatchObject({
      name: updatedScheduleName,
    });
  });

  it("should throw NotFoundError when trying to update schedule that is not found", async () => {
    const newSchedule = new ScheduleModel({
      name,
      customerId,
      metafieldId: "gid://shopify/Metaobject/77850968391",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "08:00",
              to: "16:00",
            },
          ],
        },
      ],
    });
    await newSchedule.save();

    const updatedScheduleName = "Updated Test Schedule";

    await expect(
      CustomerScheduleServiceUpdate(
        { scheduleId: newSchedule._id, customerId: 0 },
        {
          name: updatedScheduleName,
        }
      )
    ).rejects.toThrow(NotFoundError);
  });
});
