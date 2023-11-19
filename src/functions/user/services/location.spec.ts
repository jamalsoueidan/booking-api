import { faker } from "@faker-js/faker";
import { CustomerLocationServiceCreate } from "~/functions/customer/services/location";
import {
  Location,
  LocationModel,
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location";

import { CustomerServiceGet } from "~/functions/customer/services/customer";
import { LocationServiceCreate } from "~/functions/location/services/create";
import { createUser } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import { UserLocationServiceGetOne } from "./location";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/create");
const mockedLocationServiceCreate =
  LocationServiceCreate as jest.MockedFunction<typeof LocationServiceCreate>;

describe("UserLocationServiceGetOne", () => {
  const customerId = faker.number.int();

  const location1: Location = getLocationObject({
    locationType: LocationTypes.ORIGIN,
    originType: LocationOriginTypes.COMMERCIAL,
    customerId,
  });

  const location3: Location = getLocationObject({
    locationType: LocationTypes.DESTINATION,
    originType: LocationOriginTypes.COMMERCIAL,
    customerId,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    return createUser({ customerId });
  });

  it("Should be able to get one location for user", async () => {
    mockedLocationServiceCreate.mockImplementationOnce(() =>
      LocationModel.create({
        ...location1,
        geoLocation: {
          coordinates: [2, 3],
          type: "Point",
        },
        handle: faker.internet.userName(),
      })
    );

    mockedLocationServiceCreate.mockImplementationOnce(() =>
      LocationModel.create({
        ...location3,
        geoLocation: {
          coordinates: [2, 3],
          type: "Point",
        },
        handle: faker.internet.userName(),
      })
    );

    await CustomerLocationServiceCreate(location1);
    const location3doc = await CustomerLocationServiceCreate(location3);

    const user = await CustomerServiceGet({ customerId });
    const location = await UserLocationServiceGetOne<Location>({
      locationId: location3doc._id.toString(),
      username: user.username!,
    });

    expect(location).toBeDefined();
    expect(location?.distanceHourlyRate).toEqual(location3.distanceHourlyRate);
    expect(location?.isDefault).toBeFalsy();
  });
});
