import axios from "axios";
import mongoose from "mongoose";
import { UserServiceLocationsAdd } from "~/functions/user";
import { BadError, NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { LocationModel } from "../location.model";
import { Location, LocationTypes } from "../location.types";
import { ILocation, ILocationDocument } from "../schemas";

export const LocationServiceLookup = async ({
  locationId,
  destination,
}: {
  locationId: StringOrObjectId;
  destination?: {
    fullAddress: string;
  };
}) => {
  const location = await LocationModel.findOne({
    _id: new mongoose.Types.ObjectId(locationId),
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "LOCATION_NOT_FOUND",
          path: ["locationId"],
        },
      ])
    )
    .lean();

  if (location.locationType === LocationTypes.DESTINATION) {
    if (!destination) {
      throw new NotFoundError([
        {
          code: "custom",
          message: "DESTINATION_MISSING",
          path: ["destination"],
        },
      ]);
    }

    const travelTime = await LocationServiceGetTravelTime({
      origin: location.fullAddress,
      destination: destination.fullAddress,
    });

    return {
      location,
      travelTime,
    };
  }
};

export type LocationServiceCreateProps = Location;

export const LocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  let result = await LocationServiceValidateAddress(body.fullAddress);
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

export type LocationUpdateBody = Partial<ILocation>;

export const LocationServiceUpdate = async (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  if (body.fullAddress) {
    const existingLocation = await LocationModel.findOne({
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    });

    if (!existingLocation) {
      throw new NotFoundError([
        {
          code: "custom",
          message: "LOCATION_NOT_FOUND",
          path: ["location"],
        },
      ]);
    }

    if (body.fullAddress !== existingLocation.fullAddress) {
      const result = await LocationServiceValidateAddress(
        body.fullAddress,
        filter.locationId.toString()
      );

      body = {
        ...body,
        fullAddress: result.fullAddress,
        geoLocation: {
          type: "Point",
          coordinates: [result.longitude, result.latitude],
        },
        handle: createSlug(body.name || existingLocation.name),
      };
    }
  }

  const updatedLocation = await LocationModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    },
    body,
    { new: true }
  );

  if (!updatedLocation) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ]);
  }

  return updatedLocation;
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

export const LocationServiceValidateAddress = async (
  fullAddress: string,
  excludeLocationId?: string
) => {
  const response = await LocationServiceGetCoordinates({ fullAddress });
  const query: Record<string, any> = {
    $or: [{ fullAddress: response.fullAddress }],
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
        path: ["fullAddress"],
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
