import { CustomerScheduleServiceCreate } from "./create";
import { CustomerScheduleServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceList", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should return all schedules for a customerId", async () => {
    await CustomerScheduleServiceCreate({ name, customerId });
    await CustomerScheduleServiceCreate({ name: "asd", customerId: 123 });

    const schedules = await CustomerScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });
});
