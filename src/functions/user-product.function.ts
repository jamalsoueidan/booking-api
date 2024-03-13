import "module-alias/register";
import { UserProductsControllerListProductsByLocation } from "./user/controllers/products/list-by-location";

import { app } from "@azure/functions";
import { UserProductsControllerGet } from "./user/controllers/products/get";
import { UserProductsControllerGetProductsByLocation } from "./user/controllers/products/get-products";
import { UserProductsControllerListBySchedule } from "./user/controllers/products/list-by-schedule";

app.http("userProductsControllerListBySchedule", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/products",
  handler: UserProductsControllerListBySchedule,
});

app.http("userProductsControllerListByLocation", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/product/{productHandle}/location/{locationId}",
  handler: UserProductsControllerListProductsByLocation,
});

app.http("userProductsControllerGetProducts", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username}/products/location/{locationId}",
  handler: UserProductsControllerGetProductsByLocation,
});

app.http("userProductsControllerGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/products/{productHandle}",
  handler: UserProductsControllerGet,
});
