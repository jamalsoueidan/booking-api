import axios from "axios";
import mongoose from "mongoose";
import { UserServiceLocationsAdd } from "~/functions/user";
import { BadError, NotFoundError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { Location, LocationDestination } from "../location.types";
import { ILocationDocument } from "../schemas";

export type LocationServiceCreateProps = Location | LocationDestination;

export const LocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  let result = await LocationServiceValidateAddress(body);
  const location = new LocationModel(body);
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [result.longitude, result.latitude];
  location.fullAddress = result.fullAddress;
  location.handle = createSlug(body.name);
  const newLocationDoc = await location.save();
  await UserServiceLocationsAdd({
    _id: newLocationDoc._id.toString(),
    customerId: newLocationDoc.customerId,
  });
  return newLocationDoc;
};

export type LocationUpdateFilterProps = {
  locationId: ILocationDocument["_id"];
  customerId: Location["customerId"];
};

export type LocationUpdateBody =
  | Partial<Location>
  | Partial<LocationDestination>;

export const LocationServiceUpdate = async (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  const location = await LocationModel.findOne({
    _id: new mongoose.Types.ObjectId(filter.locationId),
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

  const result = await LocationServiceValidateAddress(
    location,
    filter.locationId.toString()
  );

  location.set({
    ...body,
    fullAddress: result.fullAddress,
    geoLocation: {
      type: "Point",
      coordinates: [result.longitude, result.latitude],
    },
    handle: createSlug(body.name || location.name),
  });

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
        fullAddress: firstAddress.adressebetegnelse,
        latitude,
        longitude,
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
  params: LocationServiceValidateAddressProps,
  excludeLocationId?: string
) => {
  const response = await LocationServiceGetCoordinates(params);
  const query: Record<string, any> = {
    $or: [{ name: params.name }, { fullAddress: response.fullAddress }],
  };

  if (excludeLocationId) {
    query["_id"] = { $ne: excludeLocationId };
  }

  const location = await LocationModel.findOne(query);

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

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
