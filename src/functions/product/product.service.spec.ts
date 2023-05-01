import { createProduct } from "~/library/jest/helpers";
import { IProductDocument } from "./product.schema";
import { ProductServiceGetById, ProductServiceUpdate } from "./product.service";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

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
});
