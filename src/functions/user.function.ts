import "module-alias/register";

import { app } from "@azure/functions";
import {
  UserControllerCreateOrUpdate,
  UserControllerGet,
} from "./user/user-controller";

app.http("userCreateOrUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customerId/{customerId?",
  handler: UserControllerCreateOrUpdate,
});

app.http("userGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customerId/{customerId?}",
  handler: UserControllerGet,
});
