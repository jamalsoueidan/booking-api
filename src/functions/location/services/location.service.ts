import axios from "axios";
import { BadError, NotFoundError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { Location, LocationTypes } from "../location.types";

export const LocationServiceCreate = async (body: Omit<Location, "_id">) => {
  const location = new LocationModel(body);
  if (body.locationType !== LocationTypes.CLIENT) {
    const { valid } = await LocationServiceValidateAddress(location);
    if (valid) {
      const result = await LocationServiceGetCoordinates(location);
      location.geoLocation.type = "Point";
      location.geoLocation.coordinates = [result.longitude, result.latitude];
      location.fullAddress = result.fullAddress;
      return location.save();
    }
  } else {
    location.geoLocation.type = "Point";
    location.geoLocation.coordinates = [0, 0];
    return location.save();
  }
};

type LocationUpdateProps = {
  locationId: Location["_id"];
};

export const LocationServiceUpdate = async (
  filter: LocationUpdateProps,
  body: Omit<Location, "_id">
) => {
  return LocationModel.findOneAndUpdate(filter, body).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ])
  );
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
  const url = "https://api.dataforsyningen.dk/adresser";
  const response = await axios.get<ForsyningResponse>(url, {
    params: {
      q: params.fullAddress,
      format: "json",
      token: process.env["DataforsyningenToken"] || "",
    },
  });

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

export type DataVaskAdresserResponse = {
  kategori: string;
  resultater: Array<any>;
};

type LocationServiceValidateAddressProps = Pick<Location, "fullAddress">;

export const LocationServiceValidateAddress = async (
  props: LocationServiceValidateAddressProps
) => {
  const response = await axios.get<DataVaskAdresserResponse>(
    "https://api.dataforsyningen.dk/datavask/adresser",
    {
      params: {
        betegnelse: props.fullAddress,
        token: process.env["DataforsyningenToken"] || "",
      },
    }
  );

  if (response.data.resultater.length === 1) {
    return { valid: true };
  }

  throw new BadError([
    {
      code: "custom",
      message: "LOCATION_NOT_VALIDATE",
      path: ["locationId"],
    },
  ]);
};
