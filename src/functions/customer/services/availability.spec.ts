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
        day: "monday",
        intervals: [
          {
            to: "16:00",
            from: "08:00",
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
        productId: 43,
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
        productId: 8022089597202,
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
        productId: 8022088745234,
        duration: 120,
        breakTime: 30,
        noticePeriod: {
          value: 6,
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
      productIds: [8022089597202, 8022088745234],
      startDate: "2023-05-15",
    });
  });
});
