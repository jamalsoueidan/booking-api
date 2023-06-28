import { faker } from "@faker-js/faker";
import axios from "axios";
import { CustomerServiceUpsertBody } from "~/functions/customer";
import { BadError } from "~/library/handler";
import { createUser, omitObjectIdProps } from "~/library/jest/helpers";
import { LocationDestinationTypes, LocationTypes } from "../location.types";
import { ILocationDestination, ILocationOrigin } from "../schemas";
import {
  ForsyningResponse,
  GoogleDirectionResponse,
  LocationServiceCreate,
  LocationServiceGetCoordinates,
  LocationServiceGetTravelTime,
  LocationServiceUpdate,
  LocationServiceValidateAddress,
} from "./location.service";

require("~/library/jest/mongoose/mongodb.jest");
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const customerId = 1;
const getCoordinatesData: ForsyningResponse = [
  {
    id: "",
    adressebetegnelse: "Sigridsvej 45, 1. th, 8220 Brabrand",
    adgangsadresse: {
      adgangspunkt: {
        koordinater: [10.12961271, 56.15563438],
      },
    },
  },
];

const travelTimeData: GoogleDirectionResponse = {
  routes: [
    {
      legs: [
        {
          distance: {
            text: "0.4 km",
            value: 367,
          },
          duration: {
            text: "1 min",
            value: 67,
          },
        },
      ],
    },
  ],
  status: "ok",
};

const originData: Omit<
  ILocationOrigin,
  "_id" | "createdAt" | "updatedAt" | "geoLocation"
> = {
  name: "Falafel",
  fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
  destinationType: LocationDestinationTypes.COMMERCIAL,
  locationType: LocationTypes.ORIGIN,
  customerId,
  handle: "a",
};

const originData2: Omit<
  ILocationOrigin,
  "_id" | "updatedAt" | "createdAt" | "geoLocation"
> = {
  name: "Falafel 1",
  fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
  locationType: LocationTypes.ORIGIN,
  destinationType: LocationDestinationTypes.COMMERCIAL,
  customerId,
  handle: "b",
};

const destinationData: Omit<
  ILocationDestination,
  "_id" | "createdAt" | "updatedAt"
> = {
  name: "remote",
  distanceHourlyRate: 1,
  fixedRatePerKm: 10,
  minDistanceForFree: 10,
  locationType: LocationTypes.DESTINATION,
  customerId,
};

describe("LocationService", () => {
  beforeEach(() => {
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

    return createUser({ customerId }, userData);
  });

  it("create should be able to create origin", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceCreate(originData);

    expect(omitObjectIdProps(response.toObject())).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.ORIGIN,
        customerId: 1,
        fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
        geoLocation: { coordinates: [10.12961271, 56.15563438], type: "Point" },
      })
    );
  });

  it("create should be able to create destination", async () => {
    const response = await LocationServiceCreate(destinationData);

    expect(response).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.DESTINATION,
        customerId: 1,
        distanceHourlyRate: 1,
        fixedRatePerKm: 10,
        minDistanceForFree: 10,
      })
    );
  });

  it("update should be able to update origin", async () => {
    const getCoordinatesUpdateData = [
      {
        id: "",
        adressebetegnelse: "Dortesvej 21, 1. th, 8220 Brabrand",
        adgangsadresse: {
          adgangspunkt: {
            koordinater: [11.12961271, 57.15563438],
          },
        },
      },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({
        data: getCoordinatesData,
      })
      .mockResolvedValueOnce({
        data: getCoordinatesUpdateData,
      });

    const response = await LocationServiceCreate(originData);

    const update = await LocationServiceUpdate(
      { locationId: response._id.toString(), customerId: 1 },
      {
        fullAddress: "Dortesvej 21 1, 8220 Brabrand",
        name: "Falafel 2",
        destinationType: LocationDestinationTypes.COMMERCIAL,
      }
    );

    expect(update).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.ORIGIN,
        customerId: 1,
        fullAddress: getCoordinatesUpdateData[0].adressebetegnelse,
        geoLocation: {
          coordinates:
            getCoordinatesUpdateData[0].adgangsadresse.adgangspunkt.koordinater,
          type: "Point",
        },
      })
    );
  });

  it("update should be able to update destination", async () => {
    const response = await LocationServiceCreate(destinationData);

    const update = await LocationServiceUpdate(
      { locationId: response._id.toString(), customerId: 1 },
      {
        name: "test",
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        minDistanceForFree: 5,
      }
    );

    expect(update).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.DESTINATION,
        customerId: 1,
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        minDistanceForFree: 5,
      })
    );
  });

  it("LocationServiceGetCoordinates should respond with coordinates", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceGetCoordinates({
      fullAddress: "Sigridsvej 45 1th, 8220 Brabrand",
    });

    expect(response).toEqual({
      longitude: 10.12961271,
      latitude: 56.15563438,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
    });
  });

  it("LocationServiceGetTravelTime should respond with duration and distance", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: travelTimeData,
    });

    const response = await LocationServiceGetTravelTime({
      origin: "Sigridsvej 45 1, 8220 brabrand",
      destination: "City Vest, brabrand 8220",
    });

    expect(response).toEqual({
      duration: { text: "1 min", value: 67 },
      distance: { text: "0.4 km", value: 367 },
    });
  });

  it("LocationServiceValidateAddress should respond with data", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceValidateAddress({
      name: "BySisters",
      fullAddress: "Sigridsvej 45 1th, 8220 brabrand",
    });

    expect(response).toBeDefined();
  });

  it("LocationServiceValidateAddress should throw error when name or fullAddress already exist", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    await LocationServiceCreate({
      ...originData,
      locationType: LocationTypes.ORIGIN,
      customerId: 1,
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    await expect(LocationServiceValidateAddress(originData)).rejects.toThrow(
      BadError
    );
  });
});
