import mongoose from "mongoose";

require("./mongodb.jest");

describe("jest/mongoose", () => {
  it("should be connected", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
