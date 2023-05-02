import { app } from "@azure/functions";
import "module-alias/register";
import {
  ScheduleControllerCreate,
  ScheduleControllerDestroy,
  ScheduleControllerGet,
  ScheduleControllerList,
  ScheduleControllerUpdate,
} from "./schedule";

app.http("scheduleDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{_id?}",
  handler: ScheduleControllerDestroy,
});

app.http("scheduleCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule",
  handler: ScheduleControllerCreate,
});

app.http("scheduleUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{_id?}",
  handler: ScheduleControllerUpdate,
});

app.http("scheduleGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{_id?}",
  handler: ScheduleControllerGet,
});

app.http("scheduleList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedules",
  handler: ScheduleControllerList,
});
