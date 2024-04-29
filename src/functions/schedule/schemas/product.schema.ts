import mongoose from "mongoose";
import {
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location/location.types";
import { BadError } from "~/library/handler";
import {
  ScheduleProduct,
  ScheduleProductOption,
  TimeUnit,
} from "../schedule.types";

export const OptionMongooseSchema = new mongoose.Schema<ScheduleProductOption>(
  {
    productId: {
      type: Number,
      index: true,
      required: true,
    },
    variants: [
      {
        variantId: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          default: 60,
          required: true,
        },
      },
    ],
  },
  {
    _id: false,
  }
);

export const ProductSchema = new mongoose.Schema<ScheduleProduct>(
  {
    options: [OptionMongooseSchema],
    productHandle: {
      type: String,
      index: true,
    },
    productId: {
      type: Number,
      index: true,
    },
    variantId: {
      type: Number,
      index: true,
    },
    selectedOptions: {
      name: String,
      value: String,
    },
    price: {
      amount: String,
      currencyCode: String,
    },
    compareAtPrice: {
      amount: String,
      currencyCode: String,
    },
    description: String,
    duration: {
      type: Number,
      default: 60,
    },
    breakTime: {
      type: Number,
      default: 15,
    },
    noticePeriod: {
      value: { type: Number, default: 1 },
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.HOURS,
      },
    },
    bookingPeriod: {
      value: { type: Number, default: 1 },
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.MONTHS,
      },
    },
    locations: {
      type: [
        {
          location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
          },
          locationType: {
            type: String,
            enum: [LocationTypes.ORIGIN, LocationTypes.DESTINATION],
            required: true,
          },
          originType: {
            type: String,
            enum: [LocationOriginTypes.HOME, LocationOriginTypes.COMMERCIAL],
            default: LocationOriginTypes.COMMERCIAL,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    _id: false,
  }
);

export function validateProducts(products: ScheduleProduct[]): void {
  // Check for duplicate days
  products.forEach((product, index) => {
    if (product.locations.length === 0) {
      throw new BadError([
        {
          code: "custom",
          message: "Each product must atleast have one location",
          path: [`products[${index}].locations`],
        },
      ]);
    }
  });
}
