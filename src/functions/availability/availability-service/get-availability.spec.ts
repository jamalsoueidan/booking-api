import { faker } from "@faker-js/faker";
import { addDays, addHours, isWithinInterval, setHours } from "date-fns";
import { BookingModel } from "~/functions/booking";
import { CartModel } from "~/functions/cart";
import { ProductUsersServiceAdd } from "~/functions/product-users/product-users.service";
import { Tag } from "~/functions/shift";
import {
  createProduct,
  createShift,
  createUser,
  createUserWithShift,
  createUserWithShiftAndUpdateProduct,
} from "~/library/jest/helpers";
import { AvailabilityServiceGetAvailability } from "./get-availability";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);
const tag = Tag.end_of_week;

describe("AvailabilityServiceGetAvailability", () => {
  it("Should return hours for specific user for 1 day", async () => {
    const product = await createProduct({ productId });
    const { user } = await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    const query = {
      end: addDays(new Date(), 1),
      productId: product.productId,
      userId: user._id,
      start: new Date(),
    };

    const availability = await AvailabilityServiceGetAvailability(query);
    expect(availability.length).toEqual(1);
  });

  it("Should return hours for specific user between 2 days", async () => {
    const product = await createProduct({ productId });
    const user = await createUser();

    let start = setHours(new Date(), 12);

    await createShift({
      end: addHours(start, 2),
      userId: user._id,
      start,
      tag,
    });

    start = addDays(start, 1);
    await createShift({
      end: addHours(start, 2),
      userId: user._id,
      start,
      tag,
    });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user._id,
      tag,
    });

    const query = {
      end: addDays(new Date(), 2),
      productId: product.productId,
      userId: user._id,
      start: new Date(),
    };

    const availability = await AvailabilityServiceGetAvailability(query);
    expect(availability.length).toEqual(2);
  });

  it("Should not return booked hours", async () => {
    const product = await createProduct({ productId });
    const { user } = await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    const query = {
      end: addDays(new Date(), 1),
      productId: product.productId,
      userId: user._id,
      start: new Date(),
    };

    let availability = await AvailabilityServiceGetAvailability(query);
    const shift = availability[0]?.hours[3];

    await BookingModel.create({
      customerId: 12345,
      end: shift.end,
      fulfillmentStatus: "refunded",
      lineItemId: 1100,
      lineItemTotal: 1,
      orderId: 1000,
      productId,
      userId: shift.user._id,
      start: shift.start,
      timeZone: "Europe/Paris",
      title: "anything",
    });

    availability = await AvailabilityServiceGetAvailability(query);
    const hours = availability[0]?.hours.filter(
      (h) => isWithinInterval(shift?.start, h) || isWithinInterval(shift.end, h)
    );

    expect(hours?.length).toEqual(0);
  });

  it("Should not return hours in cart", async () => {
    const product = await createProduct({ productId });
    const { user, shift } = await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    // prepare a product
    const query = {
      end: shift.end,
      productId: product.productId,
      userId: user._id,
      start: shift.start,
    };

    let availability = await AvailabilityServiceGetAvailability(query);
    const hour = availability[0].hours[3];

    const cart = await CartModel.create({
      cartId: "asd",
      end: hour?.end,
      userId: hour?.user._id,
      start: hour?.start,
    });

    availability = await AvailabilityServiceGetAvailability(query);
    const hours = availability[0]?.hours.filter(
      (h) => isWithinInterval(shift?.start, h) || isWithinInterval(shift.end, h)
    );
    expect(hours).toHaveLength(0);
  });

  it("Should not return hours in cart and booking", async () => {
    const product = await createProduct({ productId });
    const { user, shift } = await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    // prepare a product
    const query = {
      end: shift.end,
      productId: product.productId,
      userId: user._id,
      start: shift.start,
    };

    let availability = await AvailabilityServiceGetAvailability(query);
    const hour1 = faker.helpers.arrayElement(availability[0].hours);

    await CartModel.create({
      cartId: "asd",
      end: hour1.end,
      userId: hour1.user._id,
      start: hour1.start,
    });

    availability = await AvailabilityServiceGetAvailability(query);
    const hour2 = faker.helpers.arrayElement(availability[0].hours);

    await BookingModel.create({
      customerId: 12345,
      end: hour2.end,
      fulfillmentStatus: "refunded",
      lineItemId: 1100,
      lineItemTotal: 1,
      orderId: 1000,
      productId,
      userId: hour2.user._id,
      start: hour2.start,
      timeZone: "Europe/Paris",
      title: "anything",
    });

    availability = await AvailabilityServiceGetAvailability(query);
    const hours = availability[0]?.hours.filter(
      (h) =>
        isWithinInterval(hour1.start, h) ||
        isWithinInterval(hour1.end, h) ||
        isWithinInterval(hour2.end, h) ||
        isWithinInterval(hour2.end, h)
    );
    expect(hours?.length).toEqual(0);
  });

  it("Should return hours for all user in product", async () => {
    const product = await createProduct({ productId });

    const { user: user1 } = await createUserWithShift({ tag });
    const { user: user2 } = await createUserWithShift({ tag });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user1._id,
      tag,
    });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user2._id,
      tag,
    });

    const query = {
      end: addDays(new Date(), 1),
      productId: product.productId,
      start: new Date(),
    };

    const availability = await AvailabilityServiceGetAvailability(query);
    const fullNames: string[] = [];
    availability.forEach((avail) =>
      avail.hours.forEach((h) => fullNames.push(h.user.fullname))
    );
    const fullnamesUnique = [...new Set(fullNames)];
    expect(fullnamesUnique.length).toEqual(2);
  });

  it("Should return hours for all user in product without booked for one user", async () => {
    const product = await createProduct({ productId });

    const { user: user1 } = await createUserWithShift({ tag });
    const { user: user2 } = await createUserWithShift({ tag });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user1._id,
      tag,
    });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user2._id,
      tag,
    });

    const query = {
      end: addDays(new Date(), 1),
      productId: product.productId,
      start: new Date(),
    };

    let availability = await AvailabilityServiceGetAvailability(query);
    const shift = faker.helpers.arrayElement(availability[0].hours);

    await BookingModel.create({
      customerId: 12345,
      end: shift.end,
      fulfillmentStatus: "refunded",
      lineItemId: 1100,
      lineItemTotal: 1,
      orderId: 1000,
      productId,
      userId: shift.user._id,
      start: shift.start,
      timeZone: "Europe/Paris",
      title: "anything",
    });

    availability = await AvailabilityServiceGetAvailability(query);
    const hours = availability[0]?.hours.filter(
      (h) =>
        (isWithinInterval(shift.start, h) || isWithinInterval(shift.end, h)) &&
        shift.user._id.toString() === h.user._id.toString()
    );
    expect(hours?.length).toEqual(0);
  });
});
