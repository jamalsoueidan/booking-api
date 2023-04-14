import { User } from "~/functions/user";
import { WidgetShift } from "../availability.types";
import { AvailabilityServiceCreateAvailability } from "./create-availability";
import {
  AvailabilityServiceRemoveAvailability,
  AvailabilityServiceRemoveShifts,
} from "./remove-availability";

describe("AvailabilityServiceRemoveAvailability", () => {
  let availabilities: Array<WidgetShift>;

  beforeEach(() => {
    availabilities = AvailabilityServiceCreateAvailability(
      {
        buffertime: 15,
        duration: 45,
      },
      [
        {
          user: {
            _id: "1",
            fullname: "John Doe",
          } as User,
          start: new Date("2023-04-15T09:00:00Z"),
          end: new Date("2023-04-15T12:00:00Z"),
        },
      ]
    );
  });

  it("should create availability for a single schedule", async () => {});

  test("should remove overlapping shifts", () => {
    const bookings: Array<AvailabilityServiceRemoveShifts> = [
      // Define your overlapping bookings here
    ];

    const result = AvailabilityServiceRemoveAvailability(
      availabilities,
      bookings
    );

    // Expect the result to have the correct availabilities after removing overlapping shifts
  });

  test("should not remove non-overlapping shifts", () => {
    const bookings: Array<AvailabilityServiceRemoveShifts> = [
      // Define your non-overlapping bookings here
    ];

    const result = AvailabilityServiceRemoveAvailability(
      availabilities,
      bookings
    );

    // Expect the result to be the same as the original availabilities
  });

  test("should handle empty availabilities and bookings", () => {
    const emptyAvailabilities: Array<WidgetShift> = [];
    const emptyBookings: Array<AvailabilityServiceRemoveShifts> = [];

    const result = AvailabilityServiceRemoveAvailability(
      emptyAvailabilities,
      emptyBookings
    );

    // Expect the result to be an empty array
  });
});
