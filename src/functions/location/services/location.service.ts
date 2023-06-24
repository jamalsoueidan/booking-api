import axios from "axios";
import { BadError, NotFoundError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { Location, LocationTypes } from "../location.types";

export type LocationServiceCreateProps = Omit<Location, "_id">;

export const LocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  const location = new LocationModel(body);
  if (body.locationType !== LocationTypes.CLIENT) {
    const result = await LocationServiceValidateAddress(location);
    location.geoLocation.type = "Point";
    location.geoLocation.coordinates = [result.longitude, result.latitude];
    location.fullAddress = result.fullAddress;
  } else {
    location.fullAddress = LocationTypes.CLIENT;
    location.geoLocation.type = "Point";
    location.geoLocation.coordinates = [0, 0];
  }

  return location.save();
};

export type LocationUpdateFilterProps = {
  locationId: Location["_id"];
  customerId: Location["customerId"];
};

export type LocationUpdateBody = Omit<
  Location,
  "_id" | "customerId" | "locationType"
>;

export const LocationServiceUpdate = async (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  const location = await LocationModel.findOne({
    _id: filter.locationId,
    customerId: filter.customerId,
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ])
  );

  if (location.locationType !== LocationTypes.CLIENT) {
    const result = await LocationServiceValidateAddress(body);
    location.set({
      fullAddress: result.fullAddress,
      geoLocation: {
        type: "Point",
        coordinates: [result.longitude, result.latitude],
      },
    });
  } else {
    location.set({
      fullAddress: LocationTypes.CLIENT,
    });
  }

  return location.save();
};

type LocationServiceGetCoordinates = Pick<Location, "fullAddress">;

export type ForsyningResponse = Array<{
  id: string;
  adressebetegnelse: string;
  adgangsadresse: {
    adgangspunkt: {
      koordinater: Array<number>;
    };
  };
}>;

export const LocationServiceGetCoordinates = async (
  params: LocationServiceGetCoordinates
) => {
  const response = await axios.get<ForsyningResponse>(
    "https://api.dataforsyningen.dk/adresser",
    {
      params: {
        q: params.fullAddress,
        format: "json",
        token: process.env["DataforsyningenToken"] || "",
      },
    }
  );

  if (Array.isArray(response.data) && response.data.length > 0) {
    const firstAddress = response.data[0];
    if (
      firstAddress &&
      firstAddress.adgangsadresse &&
      firstAddress.adgangsadresse.adgangspunkt.koordinater
    ) {
      const [longitude, latitude] =
        firstAddress.adgangsadresse.adgangspunkt.koordinater;

      return {
        longitude,
        latitude,
        fullAddress: firstAddress.adressebetegnelse,
      };
    }
  }

  throw new BadError([
    {
      code: "custom",
      message: "FULL_ADDRESS_INVALID",
      path: ["fullAddress"],
    },
  ]);
};

type LocationServiceValidateAddressProps = Pick<
  Location,
  "fullAddress" | "name"
>;

export const LocationServiceValidateAddress = async (
  params: LocationServiceValidateAddressProps
) => {
  const response = await LocationServiceGetCoordinates(params);
  const location = await LocationModel.findOne({
    $or: [{ name: params.name }, { fullAddress: response.fullAddress }],
  });

  if (location) {
    throw new BadError([
      {
        code: "custom",
        message: "LOCATION_ALREADY_EXIST",
        path: ["name", "fullAddress"],
      },
    ]);
  }

  return response;
};

type LocationServiceGetTravelTimeProps = {
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
        duration,
        distance,
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
