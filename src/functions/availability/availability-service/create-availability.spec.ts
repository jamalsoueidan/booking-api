import { User } from "~/functions/user";
import {
  AvailabilityHourRange,
  AvailabilityHourUser,
} from "../availability.types";
import { AvailabilityServiceCreateAvailability } from "./create-availability";

describe("AvailabilityServiceCreateAvailability", () => {
  const schedules: Array<AvailabilityHourRange & AvailabilityHourUser> = [
    {
      user: {
        _id: "1",
        fullname: "John Doe",
      } as User,
      start: new Date("2023-04-15T09:00:00Z"),
      end: new Date("2023-04-15T12:00:00Z"),
    },
  ];

  it("should create availability for a single schedule", async () => {
    const result = AvailabilityServiceCreateAvailability(
      {
        buffertime: 15,
        duration: 45,
      },
      schedules
    );

    expect(result[0].hours).toHaveLength(8);
  });

  it("should have a 45-minute duration between start and end for each hour", () => {
    const result = AvailabilityServiceCreateAvailability(
      {
        buffertime: 15,
        duration: 30,
      },
      schedules
    );

    result.forEach((availabilityShift) => {
      availabilityShift.hours.forEach((hour) => {
        const startTime = hour.start.getTime();
        const endTime = hour.end.getTime();
        const durationInMilliseconds = endTime - startTime;
        const fortyFiveMinutesInMilliseconds = 45 * 60 * 1000;

        expect(durationInMilliseconds).toEqual(fortyFiveMinutesInMilliseconds);
      });
    });
  });
});
