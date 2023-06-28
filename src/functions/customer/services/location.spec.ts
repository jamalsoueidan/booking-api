import { faker } from "@faker-js/faker";
import {
  LocationDestination,
  LocationDestinationModel,
  LocationDestinationTypes,
  LocationOriginModel,
  LocationTypes,
} from "~/functions/location";
import {
  ILocationDestination,
  ILocationOrigin,
} from "~/functions/location/schemas";
import * as LocationService from "~/functions/location/services/location.service";
import { createUser } from "~/library/jest/helpers";
import { CustomerServiceGet, CustomerServiceUpsertBody } from "./customer";
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
  const customerId = faker.datatype.number();

  const location1: Omit<ILocationOrigin, "_id" | "updatedAt" | "createdAt"> = {
    name: "Falafel 1",
    fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
    locationType: LocationTypes.ORIGIN,
    geoLocation: {
      coordinates: [2, 3],
      type: "Point",
    },
    destinationType: LocationDestinationTypes.COMMERCIAL,
    customerId,
    handle: "b",
  };

  const location2: Omit<ILocationOrigin, "_id" | "updatedAt" | "createdAt"> = {
    name: "Falafel 2",
    fullAddress: "Dortesvej 45 1, 8220 Brabrand",
    locationType: LocationTypes.ORIGIN,
    geoLocation: {
      coordinates: [4, 5],
      type: "Point",
    },
    destinationType: LocationDestinationTypes.COMMERCIAL,
    customerId,
    handle: "a",
  };

  const location3: Omit<
    ILocationDestination,
    "_id" | "updatedAt" | "createdAt"
  > = {
    name: "test",
    distanceHourlyRate: 1,
    fixedRatePerKm: 10,
    minDistanceForFree: 10,
    locationType: LocationTypes.DESTINATION,
    customerId,
  };

  const userData: CustomerServiceUpsertBody = {
    username: faker.internet.userName(),
    fullname: faker.name.fullName(),
    social: {
      instagram: faker.internet.url(),
      youtube: faker.internet.url(),
      twitter: faker.internet.url(),
    },
    active: true,
    aboutMe: faker.lorem.paragraph(),
    images: {
      profile: {
        url: faker.internet.avatar(),
      },
    },
    locations: [],
    speaks: [faker.random.locale()],
    isBusiness: true,
  };

  beforeEach(() => {
    return createUser({ customerId }, userData);
  });

  it("Should be able to get one location for user", async () => {
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() => LocationDestinationModel.create(location3));

    await CustomerLocationServiceCreate(location1);
    const location3doc = await CustomerLocationServiceCreate(location3);

    const user = await CustomerServiceGet({ customerId });
    const location = await CustomerLocationServiceGetOne<LocationDestination>({
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
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() => LocationDestinationModel.create(location3));

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
      .mockImplementation(() => LocationOriginModel.create(location1));

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
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() => LocationOriginModel.create(location2));

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
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() => LocationOriginModel.create(location2));

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
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() => LocationOriginModel.create(location2));

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
    createUser({ customerId: 2 }, userData);
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(() => LocationOriginModel.create(location1))
      .mockImplementationOnce(() =>
        LocationOriginModel.create({ ...location2, customerId: 2 })
      );

    await CustomerLocationServiceCreate(location1);
    await CustomerLocationServiceCreate({ ...location2, customerId: 2 });

    const response = await CustomerLocationServiceGetAllOrigins(location1);
    console.log(response);
    expect(response).toHaveLength(1);
  });
});
