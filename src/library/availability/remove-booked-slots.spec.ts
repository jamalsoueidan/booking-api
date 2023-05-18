import { removeBookedSlots } from "./remove-booked-slots";

describe("removeBookedSlots", () => {
  it("should remove overlapping slots", () => {
    const availability = [
      {
        date: "2023-05-15T00:00:00.000Z",
        slots: [
          {
            from: "2023-05-15T08:00:00.000Z",
            to: "2023-05-15T09:30:00.000Z",
            products: [],
          },
          {
            from: "2023-05-15T09:00:00.000Z",
            to: "2023-05-15T11:30:00.000Z",
            products: [],
          },
          {
            from: "2023-05-15T16:00:00.000Z",
            to: "2023-05-15T18:30:00.000Z",
            products: [],
          },
        ],
      },
    ];

    const bookedSlots = [
      {
        from: "2023-05-15T10:00:00.000Z",
        to: "2023-05-15T11:00:00.000Z",
      },
      {
        from: "2023-05-15T17:00:00.000Z",
        to: "2023-05-15T18:00:00.000Z",
      },
    ];

    const result = removeBookedSlots(availability, bookedSlots);
    expect(result[0].slots).toHaveLength(1);
  });
});
