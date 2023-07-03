import { faker } from "@faker-js/faker";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";

export const getProductObject = (
  props: Partial<ScheduleProduct> = {}
): ScheduleProduct => ({
  productId: faker.datatype.number({ min: 1, max: 1000 }),
  variantId: faker.datatype.number({ min: 1, max: 1000 }),
  duration: faker.datatype.number({ min: 30, max: 60 }),
  breakTime: faker.datatype.number({ min: 5, max: 15 }),
  bookingPeriod: {
    unit: TimeUnit.WEEKS,
    value: faker.datatype.number({ min: 1, max: 4 }),
  },
  noticePeriod: {
    unit: TimeUnit.DAYS,
    value: faker.datatype.number({ min: 1, max: 7 }),
  },
  description: faker.commerce.productDescription(),
  locations: [],
  ...props,
});
