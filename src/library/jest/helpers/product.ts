import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { LocationTypes } from "~/functions/location";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";
import { getDumbLocationObject } from "./location";

export const getProductObject = (
  props: Partial<ScheduleProduct> = {}
): ScheduleProduct => ({
  parentId: faker.number.int({ min: 1, max: 10000000 }),
  productHandle: faker.internet.url(),
  productId: faker.number.int({ min: 1, max: 10000000 }),
  scheduleIdMetafieldId: String(faker.number.int({ min: 1, max: 10000000 })),
  variantId: faker.number.int({
    min: 10000000,
    max: 99999999,
  }),
  duration: faker.helpers.arrayElement([30, 45, 60]),
  breakTime: faker.helpers.arrayElement([5, 10, 15]),
  price: {
    currencyCode: "DKK",
    amount: "200.00",
  },
  compareAtPrice: {
    currencyCode: "DKK",
    amount: "0.00",
  },
  bookingPeriod: {
    unit: TimeUnit.WEEKS,
    value: 1,
  },
  hideFromProfile: false,
  hideFromCombine: false,
  noticePeriod: {
    unit: TimeUnit.HOURS,
    value: 1,
  },
  description: faker.commerce.productDescription(),
  locations: [
    getDumbLocationObject({
      location: new mongoose.Types.ObjectId(),
      locationType: LocationTypes.DESTINATION,
    }),
  ],
  ...props,
});
