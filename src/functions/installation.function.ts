import { app } from "@azure/functions";
import "module-alias/register";
import {
  InstallationControllerGetStatus,
  InstallationControllerSetup,
} from "./installation/installation-controller";

app.http("installationGetStatus", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "installation/get-status",
  handler: InstallationControllerGetStatus,
});

app.http("installationSetup", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "installation/setup",
  handler: InstallationControllerSetup,
});
