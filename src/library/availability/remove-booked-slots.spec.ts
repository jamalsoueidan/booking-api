import { Availability } from "~/functions/availability";
import { removeBookedSlots } from "./remove-booked-slots";

describe("removeBookedSlots", () => {
  it("should remove overlapping slots", () => {
    const availability: Availability[] = [
      {
        date: new Date("2023-05-15T00:00:00.000Z"),
        customer: {
          fullname: "asd",
          customerId: 1,
        },
        slots: [
          {
            from: new Date("2023-05-15T08:00:00.000Z"),
            to: new Date("2023-05-15T09:30:00.000Z"),
            products: [],
          },
          {
            from: new Date("2023-05-15T09:00:00.000Z"),
            to: new Date("2023-05-15T11:30:00.000Z"),
            products: [],
          },
          {
            from: new Date("2023-05-15T16:00:00.000Z"),
            to: new Date("2023-05-15T18:30:00.000Z"),
            products: [],
          },
        ],
      },
    ];

    const bookedSlots = [
      {
        from: new Date("2023-05-15T10:00:00.000Z"),
        to: new Date("2023-05-15T11:00:00.000Z"),
      },
      {
        from: new Date("2023-05-15T17:00:00.000Z"),
        to: new Date("2023-05-15T18:00:00.000Z"),
      },
    ];

    const result = removeBookedSlots(availability, bookedSlots);
    expect(result[0].slots).toHaveLength(1);
  });
});
