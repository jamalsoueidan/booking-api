import { Schedule, ScheduleModel, TimeUnit } from "~/functions/schedule";
import { compareSchedule, mergeIntervals } from "./select-products";

require("~/library/jest/mongoose/mongodb.jest");

describe("MultiAvailability", () => {
  const customerId = 1;
  const schedule1: Omit<Schedule, "_id"> = {
    name: "Test Schedule",
    customerId,
    slots: [
      {
        day: "friday",
        intervals: [
          {
            from: "08:00",
            to: "12:00",
          },
          {
            from: "14:00",
            to: "18:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 9,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 2,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 2,
          unit: TimeUnit.MONTHS,
        },
      },
      {
        productId: 99,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 2,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 2,
          unit: TimeUnit.MONTHS,
        },
      },
    ],
  };

  const schedule2: Omit<Schedule, "_id"> = {
    name: "ab",
    customerId,
    slots: [
      {
        day: "friday",
        intervals: [
          {
            from: "12:00",
            to: "18:00",
          },
        ],
      },
      {
        day: "saturday",
        intervals: [
          {
            from: "15:00",
            to: "19:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 101,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 1,
          unit: TimeUnit.MONTHS,
        },
      },
      {
        productId: 9912,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 1,
          unit: TimeUnit.MONTHS,
        },
      },
    ],
  };

  const schedule3: Omit<Schedule, "_id"> = {
    name: "abtest",
    customerId,
    slots: [
      {
        day: "friday",
        intervals: [
          {
            from: "15:00",
            to: "20:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 91,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 1,
          unit: TimeUnit.MONTHS,
        },
      },
    ],
  };

  const schedule4: Omit<Schedule, "_id"> = {
    name: "sfe",
    customerId,
    slots: [
      {
        day: "saturday",
        intervals: [
          {
            from: "17:00",
            to: "20:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 123,
        variantId: 1,
        breakTime: 15,
        duration: 60,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 1,
          unit: TimeUnit.MONTHS,
        },
      },
    ],
  };

  beforeEach(async () => {
    await ScheduleModel.create(schedule1);
    await ScheduleModel.create(schedule2);
    await ScheduleModel.create(schedule3);
    await ScheduleModel.create(schedule4);
  });

  it("should return an array of productIds that share slots with the given productIds", async () => {
    let sharedProductIds = await compareSchedule(1, [123]);
    //sharedProductIds = await findProductsSharingSlots(1, [123, 91]);
    //expect(sharedProductIds).toHaveLength(0);
  });
});

describe("mergeIntervals", () => {
  it("should correctly merge overlapping intervals", () => {
    const prevIntervals = [
      {
        from: "08:00",
        to: "12:00",
      },
      {
        from: "14:00",
        to: "18:00",
      },
    ];

    const nextIntervals = [
      {
        from: "10:00",
        to: "15:00",
      },
      {
        from: "17:00",
        to: "19:00",
      },
    ];

    const expectedResult = [
      {
        from: "10:00",
        to: "12:00",
      },
      {
        from: "14:00",
        to: "15:00",
      },
      {
        from: "17:00",
        to: "18:00",
      },
    ];

    const result = mergeIntervals(prevIntervals, nextIntervals);
    expect(result).toEqual(expectedResult);
  });

  it("should return an empty array if there are no overlapping intervals", () => {
    const prevIntervals = [
      {
        from: "08:00",
        to: "12:00",
      },
    ];

    const nextIntervals = [
      {
        from: "09:00",
        to: "14:00",
      },
      {
        from: "18:00",
        to: "20:00",
      },
    ];

    const expectedResult = [
      {
        from: "09:00",
        to: "12:00",
      },
    ];

    const result = mergeIntervals(prevIntervals, nextIntervals);
    expect(result).toEqual(expectedResult);
  });
});
