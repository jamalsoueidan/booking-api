import { Model, model } from "mongoose";
import { LocationTypes } from "./location.types";
import {
  ILocationDestinationDocument,
  ILocationDocument,
  ILocationOriginDocument,
  LocationDestinationMongooseSchema,
  LocationMongooseSchema,
  LocationOriginMongooseSchema,
} from "./schemas";

export const LocationModel = model<ILocationDocument, Model<ILocationDocument>>(
  "location",
  LocationMongooseSchema,
  "Location"
);

export const LocationOriginModel =
  LocationModel.discriminator<ILocationOriginDocument>(
    LocationTypes.ORIGIN,
    LocationOriginMongooseSchema
  );

export const LocationDestinationModel =
  LocationModel.discriminator<ILocationDestinationDocument>(
    LocationTypes.DESTINATION,
    LocationDestinationMongooseSchema
  );
