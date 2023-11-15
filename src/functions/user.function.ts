import "module-alias/register";

import { app } from "@azure/functions";
import { UserProductsControllerList } from "./user/controllers/products/list";
import { UserScheduleControllerGet } from "./user/controllers/schedule/get";
import { UserScheduleControllerGetByProductId } from "./user/controllers/schedule/get-by-product";
import { UserScheduleControllerLocationsList } from "./user/controllers/schedule/locations-list";
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

app.http("userScheduleGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedule/{scheduleId?}/location/{locationId?}",
  handler: UserScheduleControllerGet,
});

app.http("userScheduleGetByProductId", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedule/get-by-product-id/{productId}",
  handler: UserScheduleControllerGetByProductId,
});

app.http("userSchedulesLocationsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedules/locations",
  handler: UserScheduleControllerLocationsList,
});

app.http("userSchedulesLocationsListBySchedule", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedules/locations",
  handler: UserScheduleControllerLocationsList,
});

app.http("userProductsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/products",
  handler: UserProductsControllerList,
});
