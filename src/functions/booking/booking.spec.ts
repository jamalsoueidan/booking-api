import { faker } from "@faker-js/faker";
import { endOfDay, startOfDay } from "date-fns";
import { createUserWithBooking } from "~/library/jest/helpers";
import { BookingServiceGetAll } from "./booking";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);
describe("BookingServiceGetAll", () => {
  it("Should be able to get bookings for all userId by range", async () => {
    await createUserWithBooking({ productId });
    await createUserWithBooking({ productId });
    await createUserWithBooking({ productId });

    const bookings = await BookingServiceGetAll({
      end: endOfDay(new Date()),
      start: startOfDay(new Date()),
    });

    expect(bookings.length).toBe(3);
  });

  it("Should be able to get bookings for specific userId", async () => {
    const { user: user1 } = await createUserWithBooking({ productId });
    await createUserWithBooking({ productId });

    const bookings = await BookingServiceGetAll({
      end: endOfDay(new Date()),
      userId: user1._id,
      start: startOfDay(new Date()),
    });

    expect(bookings.length).toBe(1);
    expect(bookings[0].user._id).toEqual(user1._id);
  });

  it("Should be able to get bookings for few userId", async () => {
    const { user: userId1 } = await createUserWithBooking({ productId });
    await createUserWithBooking({ productId });
    const { user: userId3 } = await createUserWithBooking({ productId });

    const userIds = [userId1._id.toString(), userId3._id.toString()];
    const bookings = await BookingServiceGetAll({
      end: endOfDay(new Date()),
      userId: userIds,
      start: startOfDay(new Date()),
    });

    expect(bookings.length).toBe(2);

    const ids = bookings.map((b) => b.user._id.toString());
    expect(ids).toStrictEqual(userIds);
  });
});
