import { app } from "@azure/functions";
import "module-alias/register";
import {
  MyControllerGetAccount,
  MyControllerUpdateAccount,
} from "./my/my.controller";

app.http("myAccountUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "my-account",
  handler: MyControllerUpdateAccount,
});

app.http("myAccountGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "my-account",
  handler: MyControllerGetAccount,
});
