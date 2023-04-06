import "module-alias/register";

import { app } from "@azure/functions";
import {
  ShiftControllerCreate,
  ShiftControllerCreateGroup,
  ShiftControllerDestroy,
  ShiftControllerDestroyGroup,
  ShiftControllerGetAll,
  ShiftControllerGetGroup,
  ShiftControllerUpdate,
  ShiftControllerUpdateGroup,
} from "./shift/shift-controller";

app.http("shiftGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "/shifts",
  handler: ShiftControllerGetAll,
});

app.http("shiftCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "/shift",
  handler: ShiftControllerCreate,
});

app.http("shiftUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "/shift/{_id?}",
  handler: ShiftControllerUpdate,
});

app.http("shiftUpdate", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "/shift/{_id?}",
  handler: ShiftControllerDestroy,
});

/*
 * Group
 **************************** */

app.http("shiftCreateGroup", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "/shift/group/{groupId?}",
  handler: ShiftControllerGetGroup,
});

app.http("shiftCreateGroup", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "/shift/group",
  handler: ShiftControllerCreateGroup,
});

app.http("shiftUpdateGroup", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "/shift/group/{groupId?}",
  handler: ShiftControllerUpdateGroup,
});

app.http("shiftUpdateGroup", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "/shift/group/{groupId?}",
  handler: ShiftControllerDestroyGroup,
});
