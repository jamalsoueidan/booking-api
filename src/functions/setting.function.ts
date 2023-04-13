import { app } from "@azure/functions";
import "module-alias/register";
import { SettingControllerGet, SettingControllerUpdate } from "./setting";

app.http("settingUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "setting",
  handler: SettingControllerUpdate,
});

app.http("settingGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "setting",
  handler: SettingControllerGet,
});
