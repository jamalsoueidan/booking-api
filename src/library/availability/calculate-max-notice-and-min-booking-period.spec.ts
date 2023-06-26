import { Schedule, TimeUnit } from "~/functions/schedule";
import { calculateMaxNoticeAndMinBookingPeriod } from "./calculate-max-notice-and-min-booking-period";

describe("calculateMaxNoticeAndMinBookingPeriod", () => {
  let products: Schedule["products"];

  beforeEach(() => {
    products = [
      {
        productId: 1,
        variantId: 1,
        duration: 60,
        breakTime: 15,
        noticePeriod: { unit: TimeUnit.DAYS, value: 1 },
        bookingPeriod: { unit: TimeUnit.WEEKS, value: 2 },
        locations: [],
      },
      {
        productId: 2,
        variantId: 1,
        duration: 120,
        breakTime: 30,
        noticePeriod: { unit: TimeUnit.DAYS, value: 2 },
        bookingPeriod: { unit: TimeUnit.WEEKS, value: 1 },
        locations: [],
      },
      {
        productId: 3,
        variantId: 3,
        duration: 90,
        breakTime: 20,
        noticePeriod: { unit: TimeUnit.DAYS, value: 3 },
        bookingPeriod: { unit: TimeUnit.WEEKS, value: 3 },
        locations: [],
      },
    ];
  });

  it("should correctly calculate the maximum notice period and minimum booking period", () => {
    const { noticePeriod, bookingPeriod } =
      calculateMaxNoticeAndMinBookingPeriod(products);

    expect(noticePeriod).toEqual({ unit: "days", value: 3 });
    expect(bookingPeriod).toEqual({ unit: "weeks", value: 1 });
  });
});
