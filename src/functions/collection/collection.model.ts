import mongoose from "mongoose";
import {
  CollectionMongooseSchema,
  ICollectionDocument,
  ICollectionModel,
} from "./collection.schema";

export const CollectionModel = mongoose.model<
  ICollectionDocument,
  ICollectionModel
>("collection", CollectionMongooseSchema, "Collection");
