import axios from "axios";
import {
  GoogleDirectionResponse,
  LocationServiceGetTravelTime,
} from "./get-travel-time";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("LocationServiceGetTravelTime", () => {
  it("should respond with duration and distance", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        routes: [
          {
            legs: [
              {
                distance: {
                  text: "0.4 km",
                  value: 400,
                },
                duration: {
                  text: "1 min",
                  value: 60,
                },
              },
            ],
          },
        ],
        status: "ok",
      } as GoogleDirectionResponse,
    });

    const response = await LocationServiceGetTravelTime({
      origin: "Sigridsvej 45 1, 8220 brabrand",
      destination: "City Vest, brabrand 8220",
    });

    expect(response).toEqual({
      duration: { text: "1 min", value: 15 },
      distance: { text: "0.4 km", value: 0.4 },
    });
  });

  it("should respond with duration and distance", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        routes: [
          {
            legs: [
              {
                distance: {
                  text: "0.4 km",
                  value: 400,
                },
                duration: {
                  text: "26 min",
                  value: 1600,
                },
              },
            ],
          },
        ],
        status: "ok",
      } as GoogleDirectionResponse,
    });

    const response = await LocationServiceGetTravelTime({
      origin: "Sigridsvej 45 1, 8220 brabrand",
      destination: "City Vest, brabrand 8220",
    });

    expect(response).toEqual({
      duration: { text: "26 min", value: 30 },
      distance: { text: "0.4 km", value: 0.4 },
    });
  });
});
