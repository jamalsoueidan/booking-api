import { Schedule, TimeUnit } from "~/functions/schedule";
import { calculateMaxNoticeAndMinBookingPeriod } from "./calculate-max-notice-and-min-booking-period";

describe("calculateMaxNoticeAndMinBookingPeriod", () => {
  it("should calculate the correct notice period and booking period", () => {
    const products: Schedule["products"] = [
      {
        productId: 1,
        duration: 45,
        breakTime: 15,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
      {
        productId: 2,
        duration: 120,
        breakTime: 30,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 2,
          unit: TimeUnit.MONTHS,
        },
      },
    ];

    const { noticePeriod, bookingPeriod } =
      calculateMaxNoticeAndMinBookingPeriod(products);

    expect(noticePeriod.value).toEqual(1);
    expect(noticePeriod.unit).toEqual("hours");
    expect(bookingPeriod.value).toEqual(2);
    expect(bookingPeriod.unit).toEqual("months");
  });
});
