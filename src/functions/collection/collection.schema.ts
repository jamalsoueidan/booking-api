import mongoose, { Document, Model } from "mongoose";
import { Collection } from "./collection.types";

export interface ICollection extends Omit<Collection, "_id"> {}

export interface ICollectionDocument extends ICollection, Document {}

export interface ICollectionModel extends Model<ICollectionDocument> {}

export const CollectionMongooseSchema = new mongoose.Schema<
  ICollectionDocument,
  ICollectionModel
>({
  collectionId: {
    index: true,
    required: true,
    type: Number,
  },
  title: String,
});