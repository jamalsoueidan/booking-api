import "module-alias/register";
import { UserProductsControllerListProductsByLocation } from "./user/controllers/products/list-by-location";

import { app } from "@azure/functions";
import { UserLocationControllerGetOne } from "./user/controllers/locations/get";
import { UserProductsControllerGetProductsByLocation } from "./user/controllers/products/get-products";
import { UserProductsControllerListBySchedule } from "./user/controllers/products/list-by-schedule";
import { UserScheduleControllerGetByLocation } from "./user/controllers/schedule/get-by-location";
import { UserScheduleControllerGetByProduct } from "./user/controllers/schedule/get-by-product";
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

app.http("userScheduleServiceGetByLocationId", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedule/{scheduleId?}/location/{locationId?}",
  handler: UserScheduleControllerGetByLocation,
});

app.http("userScheduleGetByProductId", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedule/get-by-product-id/{productId}",
  handler: UserScheduleControllerGetByProduct,
});

app.http("userSchedulesLocationsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/schedules/locations",
  handler: UserScheduleControllerLocationsList,
});

app.http("UserProductsControllerListBySchedule", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/products",
  handler: UserProductsControllerListBySchedule,
});

app.http("UserProductsControllerListByLocation", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/product/{productId}/location/{locationId}",
  handler: UserProductsControllerListProductsByLocation,
});

app.http("UserProductsControllerGetProducts", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username}/products/location/{locationId}",
  handler: UserProductsControllerGetProductsByLocation,
});

app.http("UserLocationControllerGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{username}/locaion/{locationId}",
  handler: UserLocationControllerGetOne,
});
