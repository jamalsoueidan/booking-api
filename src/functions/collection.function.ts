import "module-alias/register";

import { app } from "@azure/functions";
import { CollectionControllerGetAll } from "./collection";

app.http("collectionGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "collections",
  handler: CollectionControllerGetAll,
});
