import { app } from "@azure/functions";
import "module-alias/register";
import {
  ScheduleControllerCreate,
  ScheduleControllerDestroy,
  ScheduleControllerGet,
  ScheduleControllerList,
  ScheduleControllerUpdate,
  ScheduleProductControllerCreateOrUpdate,
  ScheduleProductControllerDestroy,
  ScheduleProductControllerGet,
  ScheduleSlotControllerUpdate,
} from "./schedule";

app.http("scheduleDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}",
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
  route: "customer/{customerId?}/schedule/{scheduleId?}",
  handler: ScheduleControllerUpdate,
});

app.http("scheduleGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}",
  handler: ScheduleControllerGet,
});

app.http("scheduleList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedules",
  handler: ScheduleControllerList,
});

app.http("scheduleSlotUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}/slots",
  handler: ScheduleSlotControllerUpdate,
});

app.http("scheduleProductUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}/product/{productId?}",
  handler: ScheduleProductControllerCreateOrUpdate,
});

app.http("scheduleProductGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}/product/{productId?}",
  handler: ScheduleProductControllerGet,
});

app.http("scheduleProductDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}/product/{productId?}",
  handler: ScheduleProductControllerDestroy,
});
