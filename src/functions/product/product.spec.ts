import { addDays, addHours } from "date-fns";
import { createProduct, createShift, createUser } from "~/library/jest/helpers";
import { Tag } from "../shift";
import { User } from "../user";
import { IProductDocument } from "./product.schema";
import {
  ProductServiceGetAvailableUsers,
  ProductServiceGetById,
  ProductServiceUpdate,
} from "./product.service";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

let user1: User;
let user2: User;
let user3: User;

const tag = Tag.end_of_week;

describe("ProductService", () => {
  let product: IProductDocument;

  beforeEach(async () => {
    product = await createProduct({ productId });
  });

  it("Should find by id", async () => {
    const query = {
      id: product._id,
    };

    const findProduct = await ProductServiceGetById(query);

    expect(findProduct?.productId).toEqual(productId);
  });

  it("Should update properties by id", async () => {
    const query = {
      id: product._id,
    };

    const duration = 50;
    const buffertime = 100;
    const updated = await ProductServiceUpdate(query.id, {
      buffertime,
      duration,
    });

    const updateProduct = await ProductServiceGetById(query);

    expect(updateProduct?.duration).toEqual(duration);
    expect(updateProduct?.buffertime).toEqual(buffertime);
  });

  it("Should be able to add user, and remove user", async () => {
    user1 = await createUser();

    const start = addDays(new Date(), 1);

    await createShift({
      end: addHours(start, 5),
      userId: user1._id,
      start,
      tag,
    });

    await createShift({
      end: addHours(addDays(start, 2), 5),
      userId: user1._id,
      start: addDays(start, 2),
      tag: Tag.start_of_week,
    });

    user2 = await createUser();

    await createShift({
      end: addHours(start, 2),
      userId: user2._id,
      start,
      tag,
    });

    user3 = await createUser();

    await createShift({
      end: addHours(start, 10),
      userId: user3._id,
      start,
      tag,
    });

    const userToAdd = await ProductServiceGetAvailableUsers();
    expect(userToAdd.length).toEqual(3);

    const pickUser = userToAdd[0];
    const query = {
      id: product._id.toString(),
    };

    let updated = await ProductServiceUpdate(query.id, {
      users: [{ userId: pickUser._id, tag: pickUser.tags[0] }],
    });
    expect(updated?.users.length).toEqual(1);

    let updatedProduct = await ProductServiceGetById(query);
    expect(updatedProduct?.users.length).toEqual(1);

    updated = await ProductServiceUpdate(query.id, {
      users: [],
    });

    updatedProduct = await ProductServiceGetById(query);
    expect(updatedProduct?.users.length).toEqual(0);
  });
});
