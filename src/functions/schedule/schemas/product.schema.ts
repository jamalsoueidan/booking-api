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
    title: String,
    variants: [
      {
        variantId: {
          type: Number,
          required: true,
        },
        title: String,
        price: Number,
        duration: {
          metafieldId: {
            type: Number,
          },
          value: {
            type: Number,
            default: 60,
            required: true,
          },
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
    optionsMetafieldId: String,
    options: [OptionMongooseSchema],
    parentId: {
      type: Number,
      index: true,
    },
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
    scheduleIdMetafieldId: {
      type: String,
      index: true,
    },
    price: {
      amount: String,
      currencyCode: String,
    },
    compareAtPrice: {
      amount: String,
      currencyCode: String,
    },
    user: {
      metaobjectId: String,
      value: String,
    },
    activeMetafieldId: String,
    active: Boolean,
    hideFromProfileMetafieldId: String,
    hideFromProfile: Boolean,
    hideFromCombineMetafieldId: String,
    hideFromCombine: Boolean,
    title: String,
    description: String,
    durationMetafieldId: String,
    duration: {
      type: Number,
      default: 60,
    },
    breakTimeMetafieldId: String,
    breakTime: {
      type: Number,
      default: 15,
    },
    noticePeriod: {
      valueMetafieldId: String,
      value: { type: Number, default: 1 },
      unitMetafieldId: String,
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.HOURS,
      },
    },
    bookingPeriod: {
      valueMetafieldId: String,
      value: { type: Number, default: 1 },
      unitMetafieldId: String,
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.MONTHS,
      },
    },
    locationsMetafieldId: String,
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

/*
{
  product(handle: "afrensning") {
    id
    handle
    parentId: metafield(key: "parentId", namespace: "booking") {
      id
      value
    }
    scheduleId: metafield(key: "scheduleId", namespace: "booking") {
      id
      value
    }
    locations: metafield(key: "locations", namespace: "booking") {
      id
      value
    }
    bookingPeriodValue: metafield(key: "booking_period_value", namespace: "booking") {
      id
      value
    }
    bookingPeriodUnit: metafield(key: "booking_period_unit", namespace: "booking") {
      id
      value
    }
    noticePeriodValue: metafield(key: "notice_period_value", namespace: "booking") {
      id
      value
    }
    noticePeriodUnit: metafield(key: "notice_period_unit", namespace: "booking") {
      id
      value
    }
    duration: metafield(key: "duration", namespace: "booking") {
      id
      value
    }
    breaktime: metafield(key: "breaktime", namespace: "booking") {
      id
      value
    }
  }
}

{
  "data": {
    "product": {
      "id": "gid://shopify/Product/9196220121415",
      "handle": "testerne-new-product",
      "parentId": {
        "id": "gid://shopify/Metafield/44429081510215",
        "value": "gid://shopify/Product/8022089105682"
      },
      "scheduleId": {
        "id": "gid://shopify/Metafield/44429081542983",
        "value": "schedule"
      },
      "locations": {
        "id": "gid://shopify/Metafield/44429081411911",
        "value": "{\"locations\":[]}"
      },
      "bookingPeriodValue": {
        "id": "gid://shopify/Metafield/44429081313607",
        "value": "1"
      },
      "bookingPeriodUnit": {
        "id": "gid://shopify/Metafield/44429081280839",
        "value": "months"
      },
      "noticePeriodValue": {
        "id": "gid://shopify/Metafield/44429081477447",
        "value": "1"
      },
      "noticePeriodUnit": {
        "id": "gid://shopify/Metafield/44429081444679",
        "value": "hours"
      },
      "duration": {
        "id": "gid://shopify/Metafield/44429081379143",
        "value": "60"
      },
      "breaktime": {
        "id": "gid://shopify/Metafield/44429081346375",
        "value": "10"
      }
    }
  }
}*/
