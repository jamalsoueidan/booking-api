import axios from "axios";
import { BadError } from "~/library/handler";

export type LocationServiceGetTravelTimeProps = {
  origin: string;
  destination: string;
};

export type GoogleDirectionResponse = {
  routes: Array<{
    legs: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }>;
  }>;
  status: string;
};

export const LocationServiceGetTravelTime = async (
  params: LocationServiceGetTravelTimeProps
) => {
  const response = await axios.get<GoogleDirectionResponse>(
    "https://maps.googleapis.com/maps/api/directions/json",
    {
      params: {
        ...params,
        key: process.env["GoogleMapApi"] || "",
      },
    }
  );

  if (response.data.routes && response.data.routes.length > 0) {
    const route = response.data.routes[0];
    if (route.legs && route.legs.length > 0) {
      const leg = route.legs[0];
      const duration = leg.duration;
      const distance = leg.distance;

      return {
        duration: {
          text: duration.text,
          value: duration.value / 60, // convert from seconds to minutes
        },
        distance: {
          text: distance.text,
          value: distance.value / 1000, // convert from meters to km
        },
      };
    }
  }

  throw new BadError([
    {
      code: "custom",
      message: "FULL_ADDRESS_INVALID",
      path: ["origin", "destination"],
    },
  ]);
};
