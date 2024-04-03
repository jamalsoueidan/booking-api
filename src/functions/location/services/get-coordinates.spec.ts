import axios from "axios";
import {
  ForsyningResponse,
  LocationServiceGetCoordinates,
} from "./get-coordinates";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const getCoordinatesData: ForsyningResponse = [
  {
    id: "",
    adressebetegnelse: "Sigridsvej 45, 1. th, 8220 Brabrand",
    adgangsadresse: {
      adgangspunkt: {
        koordinater: [10.12961271, 56.15563438],
      },
      kommune: {
        navn: "Aarhus",
      },
    },
  },
];

describe("LocationServiceGetCoordinates", () => {
  it("should respond with coordinates", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: getCoordinatesData,
    });

    const response = await LocationServiceGetCoordinates({
      fullAddress: "Sigridsvej 45 1th, 8220 Brabrand",
    });

    expect(response).toEqual({
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      latitude: 56.15563438,
      longitude: 10.12961271,
    });
  });
});
