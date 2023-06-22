import axios from "axios";
import { LocationTypes } from "../location.types";
import {
  DataVaskAdresserResponse,
  ForsyningResponse,
  GoogleDirectionResponse,
  LocationServiceCreate,
  LocationServiceGetCoordinates,
  LocationServiceGetTravelTime,
  LocationServiceValidateAddress,
} from "./location.service";
require("~/library/jest/mongoose/mongodb.jest");

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const validateData: DataVaskAdresserResponse = {
  kategori: "string",
  resultater: ["1"],
};

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

describe("LocationService", () => {
  it("create should be able to create new location type commercial (fullAddress and coordinations)", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: validateData,
      })
      .mockResolvedValueOnce({
        data: getCoordinatesData,
      });

    const response = await LocationServiceCreate({
      fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
      locationType: LocationTypes.COMMERICAL,
      customerId: 1,
    });

    expect(response).toEqual(
      expect.objectContaining({
        locationType: "commercial",
        customerId: 1,
        fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
        geoLocation: { coordinates: [10.12961271, 56.15563438], type: "Point" },
      })
    );
  });

  it("create should be able to create new location type client", async () => {
    const response = await LocationServiceCreate({
      fullAddress: LocationTypes.CLIENT,
      locationType: LocationTypes.CLIENT,
      customerId: 1,
    });

    expect(response).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.CLIENT,
        customerId: 1,
        fullAddress: LocationTypes.CLIENT,
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

  it("LocationServiceValidateAddress should respond with validate(true) when ad", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: validateData,
    });

    const response = await LocationServiceValidateAddress({
      fullAddress: "Sigridsvej 45 1th, 8220 brabrand",
    });

    expect(response).toEqual({
      valid: true,
    });
  });
});
