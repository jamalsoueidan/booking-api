import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { ensureType } from "~/library/jest/helpers/mock";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateUserMetaobjectMutation } from "~/types/admin.generated";
import {
  UPDATE_USER_METAOBJECT,
  updateUserMetaobject,
} from "./update-user-metaobject";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateUserMetaobject", async () => {
    const customerId = 3;
    const user = await createUser({ customerId });
    const locationOrigin = await createLocation({
      customerId,
      metafieldId: "1",
    });

    const schedule = await createSchedule({
      metafieldId: "2",
      name: faker.person.lastName(),
      customerId,
      products: [
        getProductObject({
          locations: [
            getDumbLocationObject({
              location: locationOrigin._id,
              metafieldId: locationOrigin.metafieldId,
            }),
          ],
        }),
      ],
    });

    const schedule2 = await createSchedule({
      metafieldId: "3",
      name: faker.person.lastName(),
      customerId,
      products: [
        getProductObject({
          locations: [
            getDumbLocationObject({
              location: locationOrigin._id,
              metafieldId: locationOrigin.metafieldId,
            }),
          ],
        }),
      ],
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateUserMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                key: "about_me",
                value: user.aboutMeHtml,
              },
            ],
          },
        },
      }),
    });

    await updateUserMetaobject(user);

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, UPDATE_USER_METAOBJECT, {
      variables: {
        id: user.userMetaobjectId || "",
        fields: [
          {
            key: "fullname",
            value: user.fullname,
          },
          {
            key: "short_description",
            value: user.shortDescription || "",
          },
          {
            key: "about_me",
            value: user.aboutMeHtml || "",
          },
          {
            key: "specialties",
            value: JSON.stringify({ specialties: user.specialties || [] }),
          },
          {
            key: "professions",
            value: JSON.stringify({ professions: user.professions || [] }),
          },
          {
            key: "social",
            value: JSON.stringify(user.social),
          },
          {
            key: "locations",
            value: JSON.stringify(["1"]),
          },
          {
            key: "schedules",
            value: JSON.stringify(
              [schedule2.metafieldId, schedule.metafieldId].sort()
            ),
          },
          {
            key: "active",
            value: String(user.active),
          },
          {
            key: "theme",
            value: user.theme?.color || "pink",
          },
        ],
      },
    });
  });
});
