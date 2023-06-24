import { faker } from "@faker-js/faker";
import { LocationModel, LocationTypes } from "~/functions/location";
import { ILocation } from "~/functions/location/location.schema";
import * as LocationService from "~/functions/location/services/location.service";
import { createUser } from "~/library/jest/helpers";
import { CustomerServiceGet, CustomerServiceUpsertBody } from "./customer";
import {
  CustomerLocationCreate,
  CustomerLocationRemove,
  CustomerLocationSetDefault,
} from "./location";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationService", () => {
  const customerId = faker.datatype.number();
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

  const location1: Omit<ILocation, "updatedAt" | "createdAt"> = {
    name: "Falafel 1",
    fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
    locationType: LocationTypes.COMMERICAL,
    geoLocation: {
      coordinates: [2, 3],
      type: "Point",
    },
    customerId,
  };

  const location2: Omit<ILocation, "updatedAt" | "createdAt"> = {
    name: "Falafel 2",
    fullAddress: "Dortesvej 45 1, 8220 Brabrand",
    locationType: LocationTypes.COMMERICAL,
    geoLocation: {
      coordinates: [4, 5],
      type: "Point",
    },
    customerId,
  };

  it("Should create location and add to user", async () => {
    let user = await createUser({ customerId }, userData);
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementation(async () => {
        return LocationModel.create(location1);
      });

    const response = await CustomerLocationCreate(location1);

    user = await CustomerServiceGet({ customerId });
    const firstLocation = user.locations?.find(
      (loc) => loc.location.toString() === response._id.toString()
    );

    expect(firstLocation).toBeDefined();
    expect(firstLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(1);
  });

  it("Should create additional location and add to user", async () => {
    let user = await createUser({ customerId }, userData);
    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(async () => {
        return LocationModel.create(location1);
      })
      .mockImplementationOnce(async () => {
        return LocationModel.create(location2);
      });

    await CustomerLocationCreate(location1);
    const response = await CustomerLocationCreate(location2);

    user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === response._id.toString()
    );

    expect(secondLocation).toBeDefined();
    expect(secondLocation?.isDefault).toBeFalsy();
    expect(user.locations).toHaveLength(2);
  });

  it("Should move default to another one when default is removed", async () => {
    let user = await createUser({ customerId }, userData);

    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(async () => {
        return LocationModel.create(location1);
      })
      .mockImplementationOnce(async () => {
        return LocationModel.create(location2);
      });

    const location1doc = await CustomerLocationCreate(location1);
    const location2doc = await CustomerLocationCreate(location2);

    await CustomerLocationRemove({
      locationId: location1doc._id,
      customerId: location1doc.customerId,
    });

    user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === location2doc._id.toString()
    );

    expect(secondLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(1);
  });

  it("Should be able to set new default location", async () => {
    let user = await createUser({ customerId }, userData);

    jest
      .spyOn(LocationService, "LocationServiceCreate")
      .mockImplementationOnce(async () => {
        return LocationModel.create(location1);
      })
      .mockImplementationOnce(async () => {
        return LocationModel.create(location2);
      });

    const location1doc = await CustomerLocationCreate(location1);
    const location2doc = await CustomerLocationCreate(location2);

    await CustomerLocationSetDefault({
      locationId: location2doc._id,
      customerId: location2doc.customerId,
    });

    user = await CustomerServiceGet({ customerId });
    const secondLocation = user.locations?.find(
      (loc) => loc.location.toString() === location2doc._id.toString()
    );

    expect(secondLocation?.isDefault).toBeTruthy();
    expect(user.locations).toHaveLength(2);
  });
});
