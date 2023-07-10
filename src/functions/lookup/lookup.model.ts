import { Model, model } from "mongoose";
import { ILookupDocument, LookupMongooseSchema } from "./lookup.schema";

export const LookupModel = model<ILookupDocument, Model<ILookupDocument>>(
  "lookup",
  LookupMongooseSchema,
  "Lookup"
);
