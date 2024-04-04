import "module-alias/register";

import { app } from "@azure/functions";
import { UserControllerFilters } from "./user/controllers/user/filters";
import { UserControllerGet } from "./user/controllers/user/get";
import { UserControllerList } from "./user/controllers/user/list";
import { UserControllerProfessions } from "./user/controllers/user/professions";
import { UserControllerSearch } from "./user/controllers/user/search";
import { UserControllerTop } from "./user/controllers/user/top";
import { UserControllerUsernameTaken } from "./user/controllers/user/username-taken";

app.http("userGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}",
  handler: UserControllerGet,
});

app.http("userUsernameTaken", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/username-taken",
  handler: UserControllerUsernameTaken,
});

app.http("usersList", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users",
  handler: UserControllerList,
});

app.http("usersTop", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/top",
  handler: UserControllerTop,
});

app.http("usersProfessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/professions",
  handler: UserControllerProfessions,
});

app.http("usersFilters", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/filters",
  handler: UserControllerFilters,
});

app.http("usersSearch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/search",
  handler: UserControllerSearch,
});
