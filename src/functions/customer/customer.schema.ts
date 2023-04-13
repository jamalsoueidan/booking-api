import mongoose, { Document, Model } from "mongoose";
import { Customer } from "./customer.types";

export interface ICustomer extends Omit<Customer, "_id"> {}

export interface ICustomerDocument extends ICustomer, Document {}

export interface ICustomerModel extends Model<ICustomerDocument> {}

export const CustomerMongooseSchema = new mongoose.Schema<
  ICustomerDocument,
  ICustomerModel
>({
  customerId: { index: true, required: true, type: Number },
  email: String,
  firstName: String,
  lastName: String,
  phone: String,
});

CustomerMongooseSchema.virtual("fullname").get(function test() {
  return `${this.firstName} ${this.lastName}`;
});
