import "module-alias/register";
import { UserProductsControllerListProductsByLocation } from "./user/controllers/products/list-by-location";

import { app } from "@azure/functions";
import { UserProductsControllerGetProductsByLocation } from "./user/controllers/products/get-products";
import { UserProductsControllerListBySchedule } from "./user/controllers/products/list-by-schedule";

app.http("UserProductsControllerListBySchedule", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/products",
  handler: UserProductsControllerListBySchedule,
});

app.http("UserProductsControllerListByLocation", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/product/{productId}/location/{locationId}",
  handler: UserProductsControllerListProductsByLocation,
});

app.http("UserProductsControllerGetProducts", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username}/products/location/{locationId}",
  handler: UserProductsControllerGetProductsByLocation,
});
