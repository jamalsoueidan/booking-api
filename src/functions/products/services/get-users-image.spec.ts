import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserProductsServiceGetUsersImage } from "./get-users-image";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsServiceGetUsersImage", () => {
  it("should return user images that offer those products", async () => {
    const product1 = getProductObject({});
    const product2 = getProductObject({});
    const product3 = getProductObject({});

    const user1 = await createUser({ customerId: 1 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user1.customerId,
      products: [product1, product2],
    });

    const user2 = await createUser({ customerId: 2 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user2.customerId,
      products: [product1, product2],
    });

    let getSchedule = await UserProductsServiceGetUsersImage({
      productIds: [product1.productId],
    });

    const containsCustomerId1 = getSchedule[0].users.some(
      (item) => item.customerId === user1.customerId
    );
    const containsCustomerId2 = getSchedule[0].users.some(
      (item) => item.customerId === user2.customerId
    );

    expect(containsCustomerId1).toBe(true);
    expect(containsCustomerId2).toBe(true);

    getSchedule = await UserProductsServiceGetUsersImage({
      productIds: [12],
    });

    expect(getSchedule.length).toBe(0);
  });

  it("should limit the returned users to 5", async () => {
    const product1 = getProductObject({});
    const product2 = getProductObject({});

    const user1 = await createUser({ customerId: 1 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user1.customerId,
      products: [product1, product2],
    });

    const user2 = await createUser({ customerId: 2 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user2.customerId,
      products: [product1, product2],
    });

    const user3 = await createUser({ customerId: 3 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user3.customerId,
      products: [product1, product2],
    });

    const user4 = await createUser({ customerId: 4 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user4.customerId,
      products: [product2],
    });

    const user5 = await createUser({ customerId: 5 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user5.customerId,
      products: [product2],
    });

    const user6 = await createUser({ customerId: 6 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user6.customerId,
      products: [product2],
    });

    const user7 = await createUser({ customerId: 7 });

    await createSchedule({
      name: faker.person.firstName(),
      customerId: user7.customerId,
      products: [product2],
    });

    let getSchedule = await UserProductsServiceGetUsersImage({
      productIds: [product1.productId, product2.productId],
    });

    expect(getSchedule.length).toBe(2);

    const containsProductId1 = getSchedule.find(
      (item) => item.productId === product1.productId
    );

    expect(containsProductId1?.totalUsers).toBe(3);

    const containsProductId2 = getSchedule.find(
      (item) => item.productId === product2.productId
    );

    expect(containsProductId2?.totalUsers).toBe(7);
    expect(containsProductId2?.users.length).toBe(5);
  });
});
