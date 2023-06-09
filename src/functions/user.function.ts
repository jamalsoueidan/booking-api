import "module-alias/register";

import { app } from "@azure/functions";
import { UserScheduleControllerGet } from "./user/controllers/schedule";
import {
  UserControllerGet,
  UserControllerList,
  UserControllerProfessions,
} from "./user/controllers/user";

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

app.http("usersProfessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/professions",
  handler: UserControllerProfessions,
});

app.http("usersProfessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/professions",
  handler: UserControllerProfessions,
});

app.http("userScheduleGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username?}/schedule/{scheduleId?}/location/{locationId?}",
  handler: UserScheduleControllerGet,
});
