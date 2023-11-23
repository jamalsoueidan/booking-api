import "module-alias/register";

import { app } from "@azure/functions";
import { ProductsControllerGetUsers } from "./products/controllers/get-users";

app.http("ProductsControllerGetUsers", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "products/get-users",
  handler: ProductsControllerGetUsers,
});
