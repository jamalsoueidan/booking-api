import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerScheduleServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceList", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should return all schedules for a customerId", async () => {
    await createSchedule({ name, customerId });
    await createSchedule({ name: "asd", customerId: 123 });

    const schedules = await CustomerScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });
});
