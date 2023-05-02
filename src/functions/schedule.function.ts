import { app } from "@azure/functions";
import "module-alias/register";
import { ScheduleControllerCreate } from "./schedule/schedule.controller";

app.http("scheduleCreate", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/schedule",
  handler: ScheduleControllerCreate,
});
