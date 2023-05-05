import "module-alias/register";

import { app } from "@azure/functions";
import { UserControllerGet, UserControllerList } from "./user/controllers/user";

app.http("userGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username?}",
  handler: UserControllerGet,
});

app.http("usersList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users",
  handler: UserControllerList,
});
