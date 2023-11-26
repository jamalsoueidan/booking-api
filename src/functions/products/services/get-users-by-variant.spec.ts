import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { UserProductsServiceGetUsersVariant } from "./get-users-by-variant";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsServiceGetUsersVariant", () => {
  it("should return users that offer those that product/variant", async () => {
    const product1 = getProductObject({});
    const product2 = getProductObject({});
    const product3 = getProductObject({});

    const user1 = await createUser({ customerId: 1 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user1.customerId,
      products: [product1, product2],
    });

    const user2 = await createUser({ customerId: 2 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user2.customerId,
      products: [product1, product2],
    });

    let getSchedule = await UserProductsServiceGetUsersVariant({
      productId: product1.productId,
      variantId: product1.variantId,
    });

    const containsCustomerId1 = getSchedule.result.some(
      (item) => item.customerId === user1.customerId
    );
    const containsCustomerId2 = getSchedule.result.some(
      (item) => item.customerId === user2.customerId
    );

    expect(containsCustomerId1).toBe(true);
    expect(containsCustomerId2).toBe(true);
  });

  it("should limit the returned users to 5", async () => {
    const product1 = getProductObject({});
    const product2 = getProductObject({});

    const user1 = await createUser({ customerId: 1 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user1.customerId,
      products: [product1, product2],
    });

    const user2 = await createUser({ customerId: 2 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user2.customerId,
      products: [product1, { ...product2, variantId: 2 }],
    });

    const user3 = await createUser({ customerId: 3 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user3.customerId,
      products: [product1, product2],
    });

    const user4 = await createUser({ customerId: 4 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user4.customerId,
      products: [product2],
    });

    const user5 = await createUser({ customerId: 5 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user5.customerId,
      products: [product2],
    });

    const user6 = await createUser({ customerId: 6 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user6.customerId,
      products: [product2],
    });

    const user7 = await createUser({ customerId: 7 });

    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId: user7.customerId,
      products: [product2],
    });

    let getSchedule = await UserProductsServiceGetUsersVariant({
      productId: product2.productId,
    });

    expect(getSchedule.totalUsers).toBe(7);
    expect(getSchedule.result.length).toBe(5);

    const firstQueryUsers = getSchedule.result.map((user) => user.customerId);

    getSchedule = await UserProductsServiceGetUsersVariant({
      productId: product2.productId,
      nextCursor: getSchedule.nextCursor,
    });

    const secondQueryUsers = getSchedule.result.map((user) => user.customerId);

    expect(getSchedule.result.length).toBeLessThanOrEqual(2);
    expect(getSchedule.nextCursor).toBeUndefined();
    expect(secondQueryUsers).toEqual(
      expect.not.arrayContaining(firstQueryUsers)
    );
  });
});
