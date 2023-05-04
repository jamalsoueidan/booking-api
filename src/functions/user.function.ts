import "module-alias/register";

import { app } from "@azure/functions";
import { UserControllerGet } from "./user/controllers/user";

app.http("userGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username?}",
  handler: UserControllerGet,
});
