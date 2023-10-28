import { faker } from "@faker-js/faker";
import {
  Location,
  LocationModel,
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location";

import * as LocationService from "~/functions/location/services/location.service";
import { createUser } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import { CustomerServiceGet } from "./customer";
import {
  CustomerLocationServiceCreate,
  CustomerLocationServiceGetAll,
  CustomerLocationServiceGetAllOrigins,
  CustomerLocationServiceGetOne,
  CustomerLocationServiceRemove,
  CustomerLocationServiceSetDefault,
} from "./location";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationService", () => {
  const customerId = faker.number.int();

  const location1: Location = getLocationObject({
    locationType: LocationTypes.ORIGIN,
    originType: LocationOriginTypes.COMMERCIAL,
    customerId,
  });

  const location2: Location = getLocationObject({
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
    return createUser({ customerId });
  });

  it("Should be able to get one location for user", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
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
    const location = await CustomerLocationServiceGetOne<Location>({
      locationId: location3doc._id.toString(),
      customerId: user.customerId,
    });

    expect(location).toBeDefined();
    expect(location?.distanceHourlyRate).toEqual(location3.distanceHourlyRate);
    expect(location?.isDefault).toBeFalsy();
  });

  it("Should be able to get all locations for user", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
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
    await CustomerLocationServiceCreate(location3);

    const user = await CustomerServiceGet({ customerId });

    const locations = await CustomerLocationServiceGetAll({
      customerId: user.customerId,
    });

    const location = locations.find((l) => l.isDefault);

    expect(location).toBeDefined();
    expect(locations).toHaveLength(2);
  });

  it("Should be able create location and add to user", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementation(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      );

    const response = await CustomerLocationServiceCreate(location1);

    const user = await CustomerServiceGet({ customerId });
    const firstLocation = user.locations?.find(
      (loc) => loc.location.toString() === response._id.toString()
    );

    expect(firstLocation).toBeDefined();
    expect(firstLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(1);
  });

  it("Should be able create additional location and add to user", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location2,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      );

    await CustomerLocationServiceCreate(location1);
    const response = await CustomerLocationServiceCreate(location2);

    const user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === response._id.toString()
    );

    expect(secondLocation).toBeDefined();
    expect(secondLocation?.isDefault).toBeFalsy();
    expect(user.locations).toHaveLength(2);
  });

  it("Should be able move default to another one when default is removed", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location2,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      );

    const location1doc = await CustomerLocationServiceCreate(location1);
    const location2doc = await CustomerLocationServiceCreate(location2);

    await CustomerLocationServiceRemove({
      locationId: location1doc._id.toString(),
      customerId: location1doc.customerId,
    });

    const user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === location2doc._id.toString()
    );

    expect(secondLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(1);
  });

  it("Should be able to set new default location", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location2,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      );

    const location1doc = await CustomerLocationServiceCreate(location1);
    const location2doc = await CustomerLocationServiceCreate(location2);

    await CustomerLocationServiceSetDefault({
      locationId: location2doc._id.toString(),
      customerId: location2doc.customerId,
    });

    const user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === location2doc._id.toString()
    );

    expect(secondLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(2);
  });

  it("should be able to get all origins", async () => {
    await createUser({ customerId: 2 });
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location1,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
        })
      )
      .mockImplementationOnce(() =>
        LocationModel.create({
          ...location2,
          geoLocation: {
            coordinates: [2, 3],
            type: "Point",
          },
          handle: faker.internet.userName(),
          customerId: 2,
        })
      );

    await CustomerLocationServiceCreate(location1);
    await CustomerLocationServiceCreate({ ...location2, customerId: 2 });

    const response = await CustomerLocationServiceGetAllOrigins(location1);
    expect(response).toHaveLength(1);
  });
});
