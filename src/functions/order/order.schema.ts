import { Document, Model, Schema } from "mongoose";
import { Order } from "./order.types";

export interface IOrder extends Order {}

export interface IOrderDocument extends IOrder, Omit<Document, "id"> {}

export interface IOrderModel extends Model<IOrderDocument> {}

const DiscountCodeSchema = new Schema(
  {
    code: String,
    amount: String,
    type: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const AddressSchema = new Schema(
  {
    customer_id: Number,
    first_name: String,
    address1: String,
    phone: String,
    city: String,
    zip: String,
    country: String,
    last_name: String,
    address2: String,
    name: String,
    country_name: String,
    province_code: String,
    default: Boolean,
  },
  {
    _id: false,
  }
);

const CustomerSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      index: true,
    },
    email: String,
    accepts_marketing: Boolean,
    created_at: Date,
    updated_at: Date,
    first_name: String,
    last_name: String,
    state: String,
    note: String,
    verified_email: Boolean,
    tax_exempt: Boolean,
    phone: String,
    email_marketing_consent: {},
    sms_marketing_consent: {},
    tags: String,
    currency: String,
    accepts_marketing_updated_at: Date,
    admin_graphql_api_id: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

CustomerSchema.index({
  id: 1,
});

const LineItemSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    admin_graphql_api_id: String,
    current_quantity: { type: Number, index: true },
    fulfillable_quantity: { type: Number, index: true },
    fulfillment_service: String,
    fulfillment_status: { type: String, index: true },
    gift_card: Boolean,
    name: String,
    price: String,
    product_exists: Boolean,
    product_id: Number,
    properties: {
      from: {
        type: Date,
        index: true,
      },
      to: {
        type: Date,
        index: true,
      },
      customerId: { type: Number, index: true },
      groupId: { type: String, index: true },
      locationId: String,
      shippingId: String,
    },
    quantity: Number,
    taxable: Boolean,
    title: String,
    total_discount: String,
    variant_id: Number,
    variant_title: String,
    vendor: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

LineItemSchema.index({
  id: 1,
})
  .index({
    "properties.from": 1,
  })
  .index({
    "properties.to": 1,
  })
  .index({
    "properties.customerId": 1,
  })
  .index({
    "properties.groupId": 1,
  });

const ShippingLineSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    carrier_identifier: String,
    code: String,
    discounted_price: String,
    phone: String,
    price: String,
    requested_fulfillment_service_id: String,
    source: String,
    title: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

export const OrdreMongooseSchema = new Schema<IOrderDocument, IOrderModel>({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  admin_graphql_api_id: String,
  buyer_accepts_marketing: Boolean,
  cancel_reason: String,
  cancelled_at: Date,
  closed_at: Date,
  confirmed: Boolean,
  contact_email: String,
  created_at: Date,
  currency: String,
  current_subtotal_price: String,
  current_total_discounts: String,
  current_total_price: String,
  current_total_tax: String,
  customer_locale: String,
  discount_codes: [DiscountCodeSchema],
  email: String,
  estimated_taxes: Boolean,
  financial_status: String,
  fulfillment_status: String,
  name: String,
  note: String,
  note_attributes: [{}],
  order_number: Number,
  order_status_url: String,
  phone: String,
  presentment_currency: String,
  processed_at: Date,
  subtotal_price: String,
  tax_exempt: Boolean,
  taxes_included: Boolean,
  test: Boolean,
  total_discounts: String,
  total_line_items_price: String,
  total_outstanding: String,
  total_price: String,
  total_tax: String,
  total_tip_received: String,
  total_weight: Number,
  updated_at: Date,
  user_id: Number,
  billing_address: AddressSchema,
  customer: CustomerSchema,
  discount_applications: [{}],
  line_items: [LineItemSchema],
  shipping_lines: [ShippingLineSchema],
});
