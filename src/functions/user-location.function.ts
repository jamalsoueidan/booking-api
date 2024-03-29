import "module-alias/register";

import { app } from "@azure/functions";
import { UserLocationControllerGetOne } from "./user/controllers/locations/get";

app.http("userLocationControllerGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/location/{locationId}",
  handler: UserLocationControllerGetOne,
});
