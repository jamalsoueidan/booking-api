import { TimeUnit } from "~/functions/schedule";
import { ScheduleModel } from "~/functions/schedule/schedule.model";
import { CustomerProductAvailabilityService } from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductAvailabilityService", () => {
  const justRandomSchedule = {
    name: "another",
    customerId: 1,
    slots: [
      {
        day: "tuesday",
        intervals: [
          {
            to: "16:00",
            from: "09:30",
          },
        ],
      },
    ],
    products: [
      {
        productId: 12,
        duration: 45,
        breakTime: 15,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
    ],
  };

  let schedule = {
    name: "DEFAULT",
    customerId: 1,
    slots: [
      {
        day: "saturday",
        intervals: [
          {
            to: "14:00",
            from: "08:00",
          },
          {
            to: "18:00",
            from: "16:00",
          },
        ],
      },
      {
        day: "tuesday",
        intervals: [
          {
            to: "16:00",
            from: "09:30",
          },
        ],
      },
    ],
    products: [
      {
        productId: 1,
        duration: 45,
        breakTime: 15,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
      {
        productId: 2,
        duration: 30,
        breakTime: 5,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 2,
          unit: TimeUnit.MONTHS,
        },
      },
      // extra product
      {
        productId: 3,
        duration: 15,
        breakTime: 30,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
    ],
  };

  it("should return available slots for the given date range and product", async () => {
    await ScheduleModel.create(schedule);
    await ScheduleModel.create(justRandomSchedule);

    const result = await CustomerProductAvailabilityService({
      customerId: 1,
      productIds: [1, 2],
      startDate: "2023-05-15",
    });
  });
});
