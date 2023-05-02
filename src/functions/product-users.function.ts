import "module-alias/register";

import { app } from "@azure/functions";
import { ProductUsersControllerAdd } from "./product-users/product-users-controller/add";
import { ProductUsersControllerGetAll } from "./product-users/product-users-controller/get-all";
import { ProductUsersControllerRemove } from "./product-users/product-users-controller/remove";

app.http("productUsersGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{userId?}/products",
  handler: ProductUsersControllerGetAll,
});

app.http("productUsersAdd", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{userId?}/product/{productId}",
  handler: ProductUsersControllerAdd,
});

app.http("productUsersRemove", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "user/{userId?}/product/{productId}",
  handler: ProductUsersControllerRemove,
});
