import "module-alias/register";

import { app } from "@azure/functions";
import { UserControllerGet } from "./user/controllers/user/get";
import { UserControllerList } from "./user/controllers/user/list";
import { UserControllerProfessions } from "./user/controllers/user/professions";

app.http("userGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}",
  handler: UserControllerGet,
});

app.http("usersList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users",
  handler: UserControllerList,
});

app.http("usersProfessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/professions",
  handler: UserControllerProfessions,
});
