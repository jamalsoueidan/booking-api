import axios from "axios";
import {
  DataVaskAdresserResponse,
  ForsyningResponse,
  GoogleDirectionResponse,
  LocationServiceGetCoordinates,
  LocationServiceGetTravelTime,
  LocationServiceValidateAddress,
} from "./location.service";
require("~/library/jest/mongoose/mongodb.jest");

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("LocationService", () => {
  it("LocationServiceGetCoordinates should respond with coordinates", async () => {
    const data: ForsyningResponse = [
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

    mockedAxios.get.mockResolvedValueOnce({
      data,
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
    const data: GoogleDirectionResponse = {
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

    mockedAxios.get.mockResolvedValueOnce({
      data,
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
    const data: DataVaskAdresserResponse = {
      kategori: "string",
      resultater: ["1"],
    };

    mockedAxios.get.mockResolvedValueOnce({
      data,
    });

    const response = await LocationServiceValidateAddress({
      fullAddress: "Sigridsvej 45 1th, 8220 brabrand",
    });

    expect(response).toEqual({
      valid: true,
    });
  });
});
