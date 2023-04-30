import mongoose, { Document, Model } from "mongoose";
import { Collection } from "./collection.types";

export interface ICollection extends Omit<Collection, "_id"> {}

export interface ICollectionDocument extends ICollection, Document {}

export interface ICollectionModel extends Model<ICollectionDocument> {}

export const CollectionMongooseSchema = new mongoose.Schema<
  ICollectionDocument,
  ICollectionModel
>({
  hidden: {
    default: false,
    type: Boolean,
  },
  collectionId: {
    index: true,
    required: true,
    unique: true,
    type: Number,
  },
  productIds: [
    {
      index: true,
      required: true,
      type: Number,
    },
  ],
  image: {
    url: String,
    width: Number,
    height: Number,
  },
  title: String,
});
