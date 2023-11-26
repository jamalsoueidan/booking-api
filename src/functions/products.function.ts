import "module-alias/register";

import { app } from "@azure/functions";
import { ProductsControllerGetUsersByVariant } from "./products/controllers/get-users-by-variant";
import { ProductsControllerGetUsersImage } from "./products/controllers/get-users-image";

app.http("ProductsControllerGetUsersImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "products/get-users-image",
  handler: ProductsControllerGetUsersImage,
});

app.http("ProductsControllerGetUsersByVariant", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "products/get-users-by-variant",
  handler: ProductsControllerGetUsersByVariant,
});
