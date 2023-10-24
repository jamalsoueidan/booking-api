import { CustomerScheduleServiceCreate } from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleServiceCreate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should create a new schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.customerId).toEqual(customerId);
  });
});
