import axios from "axios";
import { BadError } from "~/library/handler";
import { createUser } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import {
  Location,
  LocationOriginTypes,
  LocationTypes,
} from "../location.types";
import { LocationServiceCreate } from "./create";
import { ForsyningResponse } from "./get-coordinates";
import { LocationServiceValidateAddress } from "./validate-address";

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

describe("LocationServiceValidateAddress", () => {
  afterEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.get.mockReset();
  });

  beforeEach(() => {
    return createUser({ customerId });
  });

  it("should respond with data", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceValidateAddress(
      "Sigridsvej 45 1th, 8220 brabrand"
    );

    expect(response).toBeDefined();
  });

  it("should throw error when name or fullAddress already exist", async () => {
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

    await expect(
      LocationServiceValidateAddress(originData.fullAddress)
    ).rejects.toThrow(BadError);
  });
});
