import { app } from "@azure/functions";
import * as df from "durable-functions";
import "module-alias/register";

import {
  CustomerScheduleControllerCreate,
  CustomerScheduleControllerDestroy,
  CustomerScheduleControllerGet,
  CustomerScheduleControllerList,
  CustomerScheduleControllerUpdate,
} from "./customer/controllers/schedule";
import { CustomerScheduleSlotControllerUpdate } from "./customer/controllers/slot";

app.http("customerScheduleDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}",
  handler: CustomerScheduleControllerDestroy,
});

app.http("customerScheduleCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule",
  handler: CustomerScheduleControllerCreate,
  extraInputs: [df.input.durableClient()],
});

app.http("customerScheduleUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}",
  handler: CustomerScheduleControllerUpdate,
  extraInputs: [df.input.durableClient()],
});

app.http("customerScheduleGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}",
  handler: CustomerScheduleControllerGet,
});

app.http("customerScheduleList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedules",
  handler: CustomerScheduleControllerList,
});

app.http("customerScheduleSlotUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule/{scheduleId?}/slots",
  handler: CustomerScheduleSlotControllerUpdate,
  extraInputs: [df.input.durableClient()],
});
