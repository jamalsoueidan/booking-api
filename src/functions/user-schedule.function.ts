import "module-alias/register";

import { app } from "@azure/functions";
import { UserScheduleControllerGetByLocation } from "./user/controllers/schedule/get-by-location";
import { UserScheduleControllerGetByProduct } from "./user/controllers/schedule/get-by-product";
import { UserScheduleControllerLocationsList } from "./user/controllers/schedule/locations-list";

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
