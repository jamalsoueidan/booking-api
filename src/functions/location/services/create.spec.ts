import axios from "axios";
import { createUser, omitObjectIdProps } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import {
  Location,
  LocationOriginTypes,
  LocationTypes,
} from "../location.types";
import { LocationServiceCreate } from "./create";
import { ForsyningResponse } from "./get-coordinates";

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

const originData: Location = getLocationObject({
  name: "Falafel",
  fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
  originType: LocationOriginTypes.COMMERCIAL,
  locationType: LocationTypes.ORIGIN,
  customerId,
  distanceHourlyRate: 1,
  fixedRatePerKm: 10,
  distanceForFree: 10,
});

const destinationData: Location = getLocationObject({
  name: "remote",
  fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
  locationType: LocationTypes.DESTINATION,
  originType: LocationOriginTypes.COMMERCIAL,
  distanceHourlyRate: 1,
  fixedRatePerKm: 10,
  distanceForFree: 10,
  customerId,
});

describe("LocationServiceCreate", () => {
  afterEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.get.mockReset();
  });

  beforeEach(() => {
    return createUser({ customerId });
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
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceCreate(destinationData);

    expect(omitObjectIdProps(response.toObject())).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.DESTINATION,
        customerId: 1,
        distanceHourlyRate: 1,
        fixedRatePerKm: 10,
        distanceForFree: 10,
      })
    );
  });
});
