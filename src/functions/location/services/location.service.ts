import axios from "axios";
import { UserServiceLocationsAdd } from "~/functions/user";
import { BadError, NotFoundError } from "~/library/handler";
import {
  LocationDestinationModel,
  LocationModel,
  LocationOriginModel,
} from "../location.model";
import {
  Location,
  LocationDestination,
  LocationOrigin,
  LocationTypes,
} from "../location.types";

type LocationUnion = LocationOrigin | LocationDestination;

export type LocationServiceCreateProps = LocationUnion & Omit<Location, "_id">;

export const LocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  let location;
  let result;

  switch (body.locationType) {
    case LocationTypes.DESTINATION:
      location = new LocationDestinationModel(body);
      break;

    case LocationTypes.ORIGIN:
      result = await LocationServiceValidateAddress(body as LocationOrigin);
      location = new LocationOriginModel(body);
      location.geoLocation.type = "Point";
      location.geoLocation.coordinates = [result.longitude, result.latitude];
      location.fullAddress = result.fullAddress;
      location.handle = createSlug(body.name);
      break;
  }

  const newLocationDoc = await location.save();
  await UserServiceLocationsAdd({
    _id: newLocationDoc._id.toString(),
    customerId: newLocationDoc.customerId,
  });
  return newLocationDoc;
};

export type LocationUpdateFilterProps = {
  locationId: Location["_id"];
  customerId: Location["customerId"];
};

export type LocationUpdateBody = LocationOrigin | LocationDestination;

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

  if (location.locationType !== LocationTypes.DESTINATION) {
    const result = await LocationServiceValidateAddress(body as LocationOrigin);
    location.set({
      fullAddress: result.fullAddress,
      geoLocation: {
        type: "Point",
        coordinates: [result.longitude, result.latitude],
      },
      handle: createSlug(body.name),
    });
  } else {
    location.set(body);
  }

  return location.save();
};

type LocationServiceGetCoordinates = Pick<LocationOrigin, "fullAddress">;

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
  LocationOrigin,
  "fullAddress" | "name"
>;

export const LocationServiceValidateAddress = async (
  params: LocationServiceValidateAddressProps
) => {
  const response = await LocationServiceGetCoordinates(params);
  const location = await LocationOriginModel.findOne({
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

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
