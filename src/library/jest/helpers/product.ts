import { faker } from "@faker-js/faker";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";

export const getProductObject = (
  props: Partial<ScheduleProduct> = {}
): ScheduleProduct => ({
  productId: faker.datatype.number({ min: 1, max: 10000000 }),
  variantId: faker.datatype.number({ min: 1, max: 10000000 }),
  duration: faker.helpers.arrayElement([30, 45, 60]),
  breakTime: faker.helpers.arrayElement([5, 10, 15]),
  bookingPeriod: {
    unit: TimeUnit.WEEKS,
    value: 1,
  },
  noticePeriod: {
    unit: TimeUnit.HOURS,
    value: 1,
  },
  description: faker.commerce.productDescription(),
  locations: [],
  ...props,
});
