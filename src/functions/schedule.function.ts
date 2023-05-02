import { app } from "@azure/functions";
import "module-alias/register";
import { ScheduleControllerCreate, ScheduleControllerList } from "./schedule";

app.http("scheduleCreate", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule",
  handler: ScheduleControllerCreate,
});

app.http("scheduleList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedules",
  handler: ScheduleControllerList,
});
