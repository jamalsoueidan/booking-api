import axios from "axios";
import { createUser } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import {
  Location,
  LocationOriginTypes,
  LocationTypes,
} from "../location.types";
import { LocationServiceCreate } from "./create";
import { ForsyningResponse } from "./get-coordinates";
import { LocationServiceUpdate } from "./update";

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

describe("LocationServiceUpdate", () => {
  afterEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.get.mockReset();
  });

  beforeEach(() => {
    return createUser({ customerId });
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
        name: "Falafel 2",
        fullAddress: "Dortesvej 21 1, 8220 Brabrand",
        originType: LocationOriginTypes.COMMERCIAL,
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

    const response = await LocationServiceCreate(destinationData);

    const update = await LocationServiceUpdate(
      { locationId: response._id.toString(), customerId: 1 },
      {
        name: "test",
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        distanceForFree: 5,
      }
    );

    expect(update).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.DESTINATION,
        customerId: 1,
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        distanceForFree: 5,
      })
    );
  });
});
