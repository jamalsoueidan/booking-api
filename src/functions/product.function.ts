import { app } from "@azure/functions";
import "module-alias/register";
import {
  ProductControllerGetAll,
  ProductControllerGetById,
  ProductControllerUpdate,
} from "./product/product-controller";

app.http("productGetById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "product/{_id?}",
  handler: ProductControllerGetById,
});

app.http("productGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "products",
  handler: ProductControllerGetAll,
});

app.http("productUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "product/{id?}",
  handler: ProductControllerUpdate,
});
